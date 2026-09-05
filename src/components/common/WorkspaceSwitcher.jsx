import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ChevronDown,
  Plus,
  Check,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import Badge from '../ui/Badge';
import WorkspaceModal from '../workspaces/WorkspaceModal';
import { useToast } from '../../hooks/useToast';
import { APP_ROUTES, ROLE_DETAILS } from '../../utils/constants';

export const WorkspaceSwitcher = ({ isCollapsed = false }) => {
  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
  } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateWorkspace = async (data) => {
    try {
      const created = await createWorkspace(data);
      toast.success(`Workspace "${created.name}" created!`, 'Workspace Ready');
      setShowCreateModal(false);
      setIsOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create workspace');
      throw err;
    }
  };

  const currentRoleMeta = activeWorkspace?.userRole
    ? ROLE_DETAILS[activeWorkspace.userRole]
    : null;

  return (
    <div className="relative px-3 py-2" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        } p-2 rounded-xl bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 transition-all text-left focus:outline-none`}
        title={activeWorkspace?.name || 'Select Workspace'}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {activeWorkspace?.name || 'No Workspace'}
              </p>
              {currentRoleMeta && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Role: {currentRoleMeta.label}
                </p>
              )}
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            isCollapsed ? 'left-full ml-2 top-0' : 'left-3 right-3 top-full mt-1'
          } w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-slide-down`}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Workspaces ({workspaces.length})
          </div>

          <div className="max-h-56 overflow-y-auto py-1 space-y-0.5 px-1">
            {workspaces.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No workspaces found
              </div>
            ) : (
              workspaces.map((ws) => {
                const isSelected = activeWorkspace?.id === ws.id;
                const roleMeta = ROLE_DETAILS[ws.userRole] || ROLE_DETAILS.member;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      switchWorkspace(ws);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Briefcase className="w-3 h-3" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="truncate">{ws.name}</p>
                        <Badge variant={roleMeta.badgeColor} size="xs">
                          {roleMeta.label}
                        </Badge>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-1 px-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowCreateModal(true);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(APP_ROUTES.WORKSPACES);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Manage All Workspaces</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      <WorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateWorkspace}
      />
    </div>
  );
};

export default WorkspaceSwitcher;
