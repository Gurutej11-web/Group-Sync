import { auth, db } from '../../firebaseConfig'
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, getDocs, increment, deleteDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

// Users
export async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || '',
      email: user.email,
      avatar: '',
      projects: [],
      role: ''
    })
  }
}
export async function getUserDoc(uid) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
export async function updateUserProfile(uid, profile) {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, profile)
}

// Batch fetch of user docs by uid for member display
export async function getUsersByIds(uids = []) {
  const uniqueIds = Array.from(new Set(uids)).filter(Boolean)
  if (!uniqueIds.length) return []
  const snapshots = await Promise.all(uniqueIds.map((uid) => getDoc(doc(db, 'users', uid))))
  return snapshots
    .filter((snap) => snap.exists())
    .map((snap) => ({ id: snap.id, ...snap.data() }))
}

// Projects
export async function createProject(project, user) {
  const ref = await addDoc(collection(db, 'projects'), {
    ...project,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    inviteCode: uuidv4().slice(0, 8),
    progress: 0,
  })
  // add project to user
  const uref = doc(db, 'users', user.uid)
  const u = await getDoc(uref)
  if (u.exists()) {
    const arr = u.data().projects || []
    await updateDoc(uref, { projects: [...arr, ref.id] })
  }
  return ref.id
}
export function listUserProjects(uid, setProjects) {
  // Some legacy projects might not have populated members; include createdBy as fallback
  const qMember = query(collection(db, 'projects'), where('members', 'array-contains', uid))
  const qOwner = query(collection(db, 'projects'), where('createdBy', '==', uid))

  const combine = (memberSnap, ownerSnap) => {
    const map = new Map()
    memberSnap?.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }))
    ownerSnap?.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }))
    const rows = Array.from(map.values())
    rows.forEach(p => {
      if (!p.createdBy && uid) {
        // Backfill creator for legacy docs
        updateDoc(doc(db, 'projects', p.id), { createdBy: uid }).catch(() => {})
      }
      if (!Array.isArray(p.members) || p.members.length === 0) {
        updateDoc(doc(db, 'projects', p.id), { members: [uid] }).catch(() => {})
      } else if (!p.members.includes(uid)) {
        updateDoc(doc(db, 'projects', p.id), { members: [...p.members, uid] }).catch(() => {})
      }
    })
    setProjects(rows)
  }

  let memberSnapCache = null
  let ownerSnapCache = null

  const unsubMember = onSnapshot(qMember, (snap) => {
    memberSnapCache = snap
    combine(memberSnapCache, ownerSnapCache)
  })
  const unsubOwner = onSnapshot(qOwner, (snap) => {
    ownerSnapCache = snap
    combine(memberSnapCache, ownerSnapCache)
  })

  return () => { unsubMember && unsubMember(); unsubOwner && unsubOwner() }
}
export function getProject(projectId, setProject) {
  const ref = doc(db, 'projects', projectId)
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) setProject({ id: snap.id, ...snap.data() })
  })
}

export async function inviteMemberByEmail(projectId, email, role = 'Contributor') {
  // Find user by email
  const q = query(collection(db, 'users'), where('email', '==', email))
  const res = await getDocs(q)
  if (res.empty) throw new Error('No user found for that email')
  const userDoc = res.docs[0]
  const uid = userDoc.id
  const pref = doc(db, 'projects', projectId)
  const psnap = await getDoc(pref)
  if (!psnap.exists()) throw new Error('Project not found')
  const data = psnap.data()
  const members = new Set(data.members || [])
  members.add(uid)
  const roles = { ...(data.roles || {}) }
  roles[uid] = role
  await updateDoc(pref, { members: Array.from(members), roles })
  // Add project to user
  const uref = doc(db, 'users', uid)
  const u = await getDoc(uref)
  if (u.exists()) {
    const arr = u.data().projects || []
    if (!arr.includes(projectId)) await updateDoc(uref, { projects: [...arr, projectId] })
  }
}

export async function joinProjectByCode(code, uid) {
  const q = query(collection(db, 'projects'), where('inviteCode', '==', code))
  const res = await getDocs(q)
  if (res.empty) throw new Error('Invalid invite code')
  const pdoc = res.docs[0]
  const projectId = pdoc.id
  const data = pdoc.data()
  const members = new Set(data.members || [])
  members.add(uid)
  const roles = { ...(data.roles || {}) }
  if (!roles[uid]) roles[uid] = 'Contributor'
  await updateDoc(doc(db, 'projects', projectId), { members: Array.from(members), roles })
  // Add project to user
  const uref = doc(db, 'users', uid)
  const u = await getDoc(uref)
  if (u.exists()) {
    const arr = u.data().projects || []
    if (!arr.includes(projectId)) await updateDoc(uref, { projects: [...arr, projectId] })
  }
  return projectId
}

export async function updateProjectMeta(projectId, patch) {
  await updateDoc(doc(db, 'projects', projectId), patch)
}

export async function deleteProject(projectId) {
  // Capture project members for cleanup
  const projectSnap = await getDoc(doc(db, 'projects', projectId))
  const members = projectSnap.exists() ? (projectSnap.data().members || []) : []

  // Clean up dependent docs BEFORE deleting project (so rules still work)
  // 1. Delete all comments (both task-level and project-level)
  const allCommentsSnap = await getDocs(query(collection(db, 'comments'), where('projectId', '==', projectId)))
  await Promise.all(allCommentsSnap.docs.map((c) => deleteDoc(c.ref)))

  // 2. Delete all tasks
  const tasksSnap = await getDocs(query(collection(db, 'tasks'), where('projectId', '==', projectId)))
  await Promise.all(tasksSnap.docs.map((t) => deleteDoc(t.ref)))

  // 3. Delete activity feed
  const activitySnap = await getDocs(query(collection(db, 'activityFeed'), where('projectId', '==', projectId)))
  await Promise.all(activitySnap.docs.map((d) => deleteDoc(d.ref)))

  // 4. Delete shoutouts
  const shoutoutsSnap = await getDocs(query(collection(db, 'shoutouts'), where('projectId', '==', projectId)))
  await Promise.all(shoutoutsSnap.docs.map((d) => deleteDoc(d.ref)))

  // 5. Delete moods
  const moodsSnap = await getDocs(query(collection(db, 'moods'), where('projectId', '==', projectId)))
  await Promise.all(moodsSnap.docs.map((d) => deleteDoc(d.ref)))

  // 6. Finally remove the project itself
  await deleteDoc(doc(db, 'projects', projectId))

  // 7. Remove project from user docs (best-effort cleanup)
  await Promise.all(members.map(async (uid) => {
    const uref = doc(db, 'users', uid)
    const usnap = await getDoc(uref)
    if (usnap.exists()) {
      const arr = (usnap.data().projects || []).filter((pid) => pid !== projectId)
      await updateDoc(uref, { projects: arr }).catch(() => {})
    }
  }))
}

// Tasks
export async function addTask(projectId, task, user) {
  const ref = await addDoc(collection(db, 'tasks'), {
    ...task,
    projectId,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  })
  await addActivity(projectId, user, `Added Task: ${task.title}`)
  return ref.id
}
export function listProjectTasks(projectId, setTasks) {
  const q = query(collection(db, 'tasks'), where('projectId', '==', projectId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setTasks(rows)
  })
}
export async function updateTaskStatus(projectId, task, status, user) {
  const ref = doc(db, 'tasks', task.id)
  await updateDoc(ref, { status })
  // Points bonus if completed before deadline
  let bonus = 0
  if (status === 'Done' && task.deadline) {
    const deadlineDate = new Date(task.deadline)
    if (Date.now() < deadlineDate.getTime()) bonus = 5
  }
  await addActivity(projectId, user, `Updated Task: ${task.title} → ${status}`)
  if (status === 'Done') await addPoints(user.uid, task.points + bonus, projectId)
}

// Leaderboard / Points
export async function addPoints(uid, points, projectId) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data()
  const key = `points_${projectId}`
  const current = data[key] || 0
  await updateDoc(ref, { [key]: current + points })
}
export function aggregateLeaderboard(projectId, setRows) {
  const q = query(collection(db, 'users'))
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => {
      const data = d.data()
      const key = `points_${projectId}`
      const points = data[key] || 0
      const badges = []
      if (points >= 100) badges.push('Legend')
      else if (points >= 50) badges.push('Top Performer')
      else if (points >= 20) badges.push('Streak Starter')
      // Achievement: First task completed
      if (points > 0 && (data.firstCompletedAwarded !== true)) {
        badges.push('First Task Completed')
      }
      // Achievement: 100% completion of assigned tasks
      // This requires checking tasks collection; simplified: if user has >0 points and no open tasks, award.
      return { user: d.id, userName: data.name || data.email, points, badges }
    }).sort((a, b) => b.points - a.points)
    setRows(rows)
  })
}

// Activity
export async function addActivity(projectId, user, action) {
  await addDoc(collection(db, 'activityFeed'), {
    projectId,
    user: user.uid,
    action,
    timestamp: serverTimestamp(),
  })
}
export function listActivityForProject(projectId, setActivity) {
  const q = query(collection(db, 'activityFeed'), where('projectId', '==', projectId), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setActivity(rows)
  })
}

// Comments
export function listCommentsForTask(taskId, setComments) {
  const q = query(collection(db, 'comments'), where('taskId', '==', taskId), orderBy('timestamp', 'asc'))
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setComments(rows)
  })
}

export function listCommentsForProject(projectId, setComments) {
  if (!projectId) return () => {}
  const q = query(collection(db, 'comments'), where('projectId', '==', projectId), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setComments(rows)
  })
}

export async function addComment(taskId, projectId, { text }, user) {
  await addDoc(collection(db, 'comments'), {
    taskId,
    projectId,
    user: user.uid,
    userName: user.displayName || user.email,
    text,
    timestamp: serverTimestamp(),
  })
  // Mentions: rudimentary detection and activity entry
  const mentions = Array.from(text.matchAll(/@([\w .-]+)/g)).map(m => m[1].trim().toLowerCase())
  if (mentions.length) {
    // try to find users by name and log activity (no guarantee in rules)
    const ures = await getDocs(collection(db, 'users'))
    mentions.forEach(name => {
      ures.forEach(docu => {
        const uname = (docu.data().name || '').toLowerCase()
        if (uname && uname.includes(name)) {
          // Note: We don't directly notify; we log activity for project based on task's projectId
        }
      })
    })
  }
}

export async function updateComment(commentId, { text }) {
  await updateDoc(doc(db, 'comments', commentId), { text })
}

export async function deleteCommentDoc(commentId) {
  await deleteDoc(doc(db, 'comments', commentId))
}

// Human Interaction: Shoutouts & Mood
export function listShoutouts(projectId, setShoutouts) {
  if (!projectId) return () => {}
  const q = query(collection(db, 'shoutouts'), where('projectId', '==', projectId), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setShoutouts(rows)
  })
}

export async function addShoutout({ message, toUser, toName, projectId }, user) {
  if (!projectId) throw new Error('Select a project first')
  await addDoc(collection(db, 'shoutouts'), {
    message,
    toUser: toUser || null,
    toName: toName || 'Team',
    fromUser: user.uid,
    fromName: user.displayName || user.email,
    cheers: 0,
    projectId,
    timestamp: serverTimestamp(),
  })
}

export async function cheerShoutout(shoutoutId) {
  const ref = doc(db, 'shoutouts', shoutoutId)
  await updateDoc(ref, { cheers: increment(1) })
}

export async function updateShoutout(shoutoutId, { message, toName }) {
  await updateDoc(doc(db, 'shoutouts', shoutoutId), { message, toName })
}

export async function deleteShoutout(shoutoutId) {
  await deleteDoc(doc(db, 'shoutouts', shoutoutId))
}

export function listMoods(projectId, setMoods) {
  if (!projectId) return () => {}
  const q = query(collection(db, 'moods'), where('projectId', '==', projectId), orderBy('updatedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setMoods(rows)
  })
}

export async function setMoodStatus(user, mood, note = '', projectId) {
  if (!projectId) throw new Error('Select a project first')
  const ref = doc(db, 'moods', `${projectId}_${user.uid}`)
  await setDoc(ref, {
    user: user.uid,
    name: user.displayName || user.email,
    mood,
    note,
    projectId,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteMood(projectId, uid) {
  await deleteDoc(doc(db, 'moods', `${projectId}_${uid}`))
}
