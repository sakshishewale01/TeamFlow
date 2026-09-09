import { CheckSquare, Plus, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'

export function TasksPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Tasks
            </h1>
            <Badge variant="primary">Foundation</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track, assign, and organize team tasks across sprints and boards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filter
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Task status filter tabs placeholder */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-medium text-slate-500 dark:text-slate-400">
        <button
          type="button"
          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
        >
          All Tasks (0)
        </button>
        <button
          type="button"
          disabled
          className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-not-allowed"
        >
          To Do
        </button>
        <button
          type="button"
          disabled
          className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-not-allowed"
        >
          In Progress
        </button>
        <button
          type="button"
          disabled
          className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-not-allowed"
        >
          Review
        </button>
        <button
          type="button"
          disabled
          className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-not-allowed"
        >
          Done
        </button>
      </div>

      {/* Main Content Area: Empty State */}
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={CheckSquare}
            title="Task Management Ready"
            description="The tasks foundation is in place. Interactive Kanban drag-and-drop boards, status filtering, and assignee management will be connected to Supabase in Phase 5."
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default TasksPage
