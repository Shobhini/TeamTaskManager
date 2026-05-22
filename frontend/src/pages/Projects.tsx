import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FolderOpen } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import * as projectsApi from '../api/projects';

interface Project {
  id: string;
  name: string;
  description: string | null;
  role: string;
}

const inputClass = 'w-full bg-[#373C3F] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#D4D4D4] placeholder-[#6B6B6B] focus:outline-none focus:border-[#447ACB] transition-colors';

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
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setError('');
    setName('');
    setDescription('');
  }

  const actionButton = (
    <button
      onClick={() => setShowModal(true)}
      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
    >
      <Plus size={16} />
      New Project
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="min-h-screen bg-[#191919]"
    >
      <PageHeader title="Projects" action={actionButton} />

      <div className="px-6 py-6">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            heading="No projects yet"
            subtext="Create a project to start managing tasks with your team"
            action={
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                <Plus size={14} />
                New Project
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  to={`/projects/${project.id}`}
                  className="block bg-[#2F3437] border border-white/[0.08] hover:border-white/20 hover:shadow-lg rounded-xl p-5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="font-semibold text-[#D4D4D4] group-hover:text-white text-[15px] leading-tight">
                      {project.name}
                    </h2>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium shrink-0 ml-2 mt-0.5 ${
                        project.role === 'ADMIN'
                          ? 'bg-indigo-500/15 text-indigo-400'
                          : 'bg-white/[0.08] text-[#6B6B6B]'
                      }`}
                    >
                      {project.role}
                    </span>
                  </div>
                  {project.description ? (
                    <p className="text-[13px] text-[#9B9B9B] line-clamp-2">{project.description}</p>
                  ) : (
                    <p className="text-[13px] text-[#454B4E]">No description</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={closeModal}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-[#2F3437] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-semibold">New Project</h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-[#6B6B6B] hover:text-[#D4D4D4] transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>

                {error && (
                  <div className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-lg px-3 py-2 mb-4">
                    <p className="text-[#CD4945] text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label htmlFor="project-name" className="block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5">
                      Project name
                    </label>
                    <input
                      id="project-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="My Project"
                      className={inputClass}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label htmlFor="project-description" className="block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5">
                      Description <span className="normal-case font-normal text-[#454B4E]">optional</span>
                    </label>
                    <input
                      id="project-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What's this project about?"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {creating ? 'Creating...' : 'Create Project'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full text-[#6B6B6B] hover:text-[#D4D4D4] py-2 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
