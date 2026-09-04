import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {
  const { user } = useAuth()

  const [workspaces, setWorkspaces] = useState([])
  const [activeWorkspace, setActiveWorkspace] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all workspaces where the current user is a member
  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([])
      setActiveWorkspace(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspaces (
            id,
            name,
            description,
            created_by,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', {
          referencedTable: 'workspaces',
          ascending: false,
        })

      if (fetchError) {
        throw fetchError
      }

      const workspaceList = (data ?? [])
        .filter((row) => row.workspaces !== null)
        .map((row) => ({
          ...row.workspaces,
          role: row.role,
        }))

      setWorkspaces(workspaceList)

      // Keep the selected workspace if it still exists.
      // Otherwise, select the first workspace.
      setActiveWorkspace((previousWorkspace) => {
        if (previousWorkspace) {
          const existingWorkspace = workspaceList.find(
            (workspace) => workspace.id === previousWorkspace.id
          )

          return existingWorkspace ?? workspaceList[0] ?? null
        }

        return workspaceList[0] ?? null
      })
    } catch (err) {
      console.error(
        '[WorkspaceContext] fetchWorkspaces:',
        err.message
      )

      setError(err.message || 'Failed to load workspaces.')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch workspaces whenever the logged-in user changes
  useEffect(() => {
    const loadWorkspaces = async () => {
      await fetchWorkspaces()
    }

    loadWorkspaces()
  }, [fetchWorkspaces])

  // Create a new workspace
  const createWorkspace = useCallback(
    async ({ name, description = '' }) => {
      if (!user) {
        throw new Error(
          'You must be logged in to create a workspace.'
        )
      }

      const trimmedName = name?.trim()

      if (!trimmedName) {
        throw new Error('Workspace name cannot be empty.')
      }

      const trimmedDescription = description?.trim() || null

      const { data, error: insertError } = await supabase
        .from('workspaces')
        .insert({
          name: trimmedName,
          description: trimmedDescription,
          created_by: user.id,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Refresh the workspace list after creation
      await fetchWorkspaces()

      return data
    },
    [user, fetchWorkspaces]
  )

  // Select an active workspace
  const selectWorkspace = useCallback((workspace) => {
    setActiveWorkspace(workspace)
  }, [])

  const value = {
    workspaces,
    activeWorkspace,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    selectWorkspace,
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspace() {
  const context = useContext(WorkspaceContext)

  if (!context) {
    throw new Error(
      'useWorkspace must be used within a WorkspaceProvider'
    )
  }

  return context
}