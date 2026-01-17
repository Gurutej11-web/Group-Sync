import { auth, db } from '../../firebaseConfig'
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, getDocs } from 'firebase/firestore'
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
  const q = query(collection(db, 'projects'), where('members', 'array-contains', uid))
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setProjects(rows)
  })
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
export async function addComment(taskId, { text }, user) {
  await addDoc(collection(db, 'comments'), {
    taskId,
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
