export default function ProjectCard({ project }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{project.title}</h3>
          <p className="text-sm text-gray-600">{project.description}</p>
        </div>
        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">{(project.progress ?? 0)}%</span>
      </div>
    </div>
  )
}
