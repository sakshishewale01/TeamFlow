import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FolderKanban, CheckSquare, Loader2, ArrowRight } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { searchService } from '@/services/searchService';
import { PROJECT_STATUS_DETAILS, TASK_STATUS_DETAILS } from '@/utils/constants';

export const GlobalSearch = ({ isMobile = false, onMobileClose = null }) => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace() || {};

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({ projects: [], tasks: [] });
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();

  // Combine results into a flattened array for keyboard navigation
  const flatItems = React.useMemo(() => {
    const items = [];
    (results.projects || []).forEach((project) => {
      items.push({ type: 'project', data: project });
    });
    (results.tasks || []).forEach((task) => {
      items.push({ type: 'task', data: task });
    });
    return items;
  }, [results]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setResults({ projects: [], tasks: [] });
      setIsLoading(false);
      setIsOpen(false);
      setSelectedIndex(-1);
    } else {
      setIsOpen(true);
      setSelectedIndex(-1);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || !activeWorkspace?.id) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchService.searchWorkspace(activeWorkspace.id, trimmed);
        setResults(data);
      } catch (err) {
        console.error('[GlobalSearch] Error searching workspace:', err);
        setResults({ projects: [], tasks: [] });
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, activeWorkspace?.id]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        if (isMobile && onMobileClose) {
          onMobileClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, onMobileClose]);

  const handleSelect = useCallback(
    (item) => {
      setIsOpen(false);
      setQuery('');
      setSelectedIndex(-1);

      if (isMobile && onMobileClose) {
        onMobileClose();
      }

      if (item.type === 'project') {
        navigate(`/projects/${item.data.id}`);
      } else if (item.type === 'task') {
        const task = item.data;
        if (task.project_id) {
          navigate(`/projects/${task.project_id}?taskId=${task.id}`);
        } else {
          navigate(`/tasks?taskId=${task.id}`);
        }
      }
    },
    [navigate, isMobile, onMobileClose]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      if (isMobile && onMobileClose) {
        onMobileClose();
      } else {
        inputRef.current?.blur();
      }
      return;
    }

    if (!isOpen || flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
        handleSelect(flatItems[selectedIndex]);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults({ projects: [], tasks: [] });
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const hasProjects = results.projects && results.projects.length > 0;
  const hasTasks = results.tasks && results.tasks.length > 0;
  const hasResults = hasProjects || hasTasks;
  const showEmpty = !isLoading && query.trim() && !hasResults;

  return (
    <div
      ref={containerRef}
      className={`relative ${isMobile ? 'w-full' : 'w-64 md:w-80 lg:w-96'}`}
    >
      {/* Search Input Box */}
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search projects, tasks..."
          aria-label="Search projects, tasks..."
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          autoFocus={isMobile}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-9 pr-9 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
        />

        {/* Right Action: Loading Spinner or Clear Button */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              aria-label="Clear search text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown / Popover Results */}
      {isOpen && query.trim() && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-[75vh] sm:max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all animate-in fade-in zoom-in-95 duration-100"
        >
          {isLoading && !hasResults && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              <span>Searching workspace...</span>
            </div>
          )}

          {showEmpty && (
            <div className="py-8 px-4 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No results found
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto truncate">
                No projects or tasks match "{query.trim()}"
              </p>
            </div>
          )}

          {/* PROJECTS GROUP */}
          {hasProjects && (
            <div className="mb-2">
              <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span>Projects</span>
                <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                  {results.projects.length}
                </span>
              </div>
              <div className="space-y-0.5">
                {results.projects.map((project) => {
                  const itemIndex = flatItems.findIndex(
                    (i) => i.type === 'project' && i.data.id === project.id
                  );
                  const isSelected = itemIndex === selectedIndex;
                  const statusInfo = PROJECT_STATUS_DETAILS[project.status] || {
                    label: project.status,
                  };

                  return (
                    <button
                      key={project.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect({ type: 'project', data: project })}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                        <FolderKanban className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {project.name}
                          </p>
                          {project.status && (
                            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {statusInfo.label}
                            </span>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0 self-center opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TASKS GROUP */}
          {hasTasks && (
            <div>
              <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span>Tasks</span>
                <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                  {results.tasks.length}
                </span>
              </div>
              <div className="space-y-0.5">
                {results.tasks.map((task) => {
                  const itemIndex = flatItems.findIndex(
                    (i) => i.type === 'task' && i.data.id === task.id
                  );
                  const isSelected = itemIndex === selectedIndex;
                  const statusInfo = TASK_STATUS_DETAILS[task.status] || {
                    label: task.status,
                  };

                  return (
                    <button
                      key={task.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect({ type: 'task', data: task })}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {task.title}
                          </p>
                          {task.status && (
                            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {statusInfo.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.project?.name && (
                            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">
                              {task.project.name}
                            </span>
                          )}
                          {task.description && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0 self-center opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Keyboard Navigation Helper Footer */}
          {hasResults && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 px-2.5 py-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-2">
                <span>Use <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[9px]">↑</kbd> <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[9px]">↓</kbd> to navigate</span>
                <span>•</span>
                <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[9px]">Enter</kbd> to select</span>
              </div>
              <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[9px]">Esc</kbd> to close</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
