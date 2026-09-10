import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { projectService } from './projectService';
import { taskService } from './taskService';
import { TASK_STATUS } from '../utils/constants';

export const dashboardService = {
  /**
   * Fetch complete workspace dashboard metrics and activity
   * @param {string} workspaceId - Active workspace UUID
   * @returns {Promise<Object>} Aggregated dashboard payload
   */
  async getDashboardData(workspaceId) {
    if (!isSupabaseConfigured || !workspaceId) {
      return this.getEmptyDashboard();
    }

    try {
      // 1. Concurrently fetch workspace projects and tasks
      const [projects, tasks] = await Promise.all([
        projectService.getProjects(workspaceId),
        taskService.getWorkspaceTasks(workspaceId),
      ]);

      // 2. Fetch recent comments if tasks exist
      let recentComments = [];
      if (tasks && tasks.length > 0) {
        const taskIds = tasks.map((t) => t.id);
        const { data: commentsData, error: cErr } = await supabase
          .from('comments')
          .select(`
            id,
            task_id,
            content,
            created_at,
            user:profiles(id, full_name, email, avatar_url),
            task:tasks(id, title, project:projects(id, name))
          `)
          .in('task_id', taskIds.slice(0, 50))
          .order('created_at', { ascending: false })
          .limit(5);

        if (!cErr && commentsData) {
          recentComments = commentsData;
        }
      }

      // 3. Compute KPI metrics
      const totalProjects = projects.length;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === TASK_STATUS.DONE).length;
      const pendingTasks = totalTasks - completedTasks;
      const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      // 4. Status Breakdown
      const statusCounts = {
        [TASK_STATUS.TODO]: 0,
        [TASK_STATUS.IN_PROGRESS]: 0,
        [TASK_STATUS.REVIEW]: 0,
        [TASK_STATUS.DONE]: 0,
      };

      tasks.forEach((t) => {
        const s = t.status || TASK_STATUS.TODO;
        if (statusCounts[s] !== undefined) {
          statusCounts[s] += 1;
        }
      });

      // 5. Priority Breakdown
      const priorityCounts = {
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      tasks.forEach((t) => {
        const p = t.priority || 'medium';
        if (priorityCounts[p] !== undefined) {
          priorityCounts[p] += 1;
        }
      });

      // 6. Deadlines and Overdue Calculations (date-only boundary logic)
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const nowTime = now.getTime();

      const activeTasksWithDue = tasks.filter(
        (t) => t.due_date && t.status !== TASK_STATUS.DONE
      );

      const upcomingTasks = [];
      const overdueTasks = [];

      activeTasksWithDue.forEach((t) => {
        const dueDate = new Date(t.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const dueTime = dueDate.getTime();

        if (dueTime < nowTime) {
          const daysOverdue = Math.max(1, Math.round((nowTime - dueTime) / (1000 * 60 * 60 * 24)));
          overdueTasks.push({ ...t, daysOverdue });
        } else {
          const daysUntilDue = Math.round((dueTime - nowTime) / (1000 * 60 * 60 * 24));
          upcomingTasks.push({ ...t, daysUntilDue });
        }
      });

      // Sort upcoming by due date ascending (nearest first)
      upcomingTasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      // Sort overdue by due date ascending (longest overdue first)
      overdueTasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

      // 7. Recent Tasks (latest 5 created or updated)
      const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
        .slice(0, 5);

      return {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate,
        statusCounts,
        priorityCounts,
        upcomingTasks: upcomingTasks.slice(0, 5),
        overdueTasks: overdueTasks.slice(0, 5),
        totalOverdueCount: overdueTasks.length,
        recentTasks,
        recentComments,
        projects,
      };
    } catch (error) {
      console.error('[dashboardService] getDashboardData error:', error);
      throw error;
    }
  },

  /**
   * Return empty placeholder payload for unconfigured or empty workspaces
   */
  getEmptyDashboard() {
    return {
      totalProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      completionRate: 0,
      statusCounts: {
        [TASK_STATUS.TODO]: 0,
        [TASK_STATUS.IN_PROGRESS]: 0,
        [TASK_STATUS.REVIEW]: 0,
        [TASK_STATUS.DONE]: 0,
      },
      priorityCounts: {
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      upcomingTasks: [],
      overdueTasks: [],
      totalOverdueCount: 0,
      recentTasks: [],
      recentComments: [],
      projects: [],
    };
  },
};

export default dashboardService;
