import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import * as projectsApi from '../api/projects';

interface Project {
  id: string;
  name: string;
  description: string | null;
  role: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    projectsApi.listProjects().then((res) => setProjects(res.data.projects));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await projectsApi.createProject({ name, description });
      setProjects((prev) => [...prev, { ...res.data.project, role: 'ADMIN' }]);
      setShowModal(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  const actionButton = (
    <button
      onClick={() => setShowModal(true)}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      New Project
    </button>
  );

  return (
    <div className="min-h-screen bg-[#111111]">
      <PageHeader title="Projects" action={actionButton} />

      <div className="px-8 py-6">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl text-zinc-700 mb-4">◫</span>
            <p className="text-zinc-400 font-medium">No projects yet</p>
            <p className="text-zinc-600 text-sm mt-1">Create a project to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group bg-[#1A1A1A] border border-[#2A2A2A] hover:border-blue-500/40 rounded-xl p-5 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-[#F5F5F5] group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-mono font-medium shrink-0 ml-2 ${
                      project.role === 'ADMIN'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {project.role}
                  </span>
                </div>
                {project.description ? (
                  <p className="text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                ) : (
                  <p className="text-sm text-zinc-700">No description</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-[#F5F5F5] font-semibold mb-5">New Project</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Project name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="My Project"
                  className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this project about?"
                  className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(''); }}
                  className="flex-1 border border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 hover:bg-[#222222] py-2 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
