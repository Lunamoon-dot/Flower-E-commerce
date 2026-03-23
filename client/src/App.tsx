import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "@/routes"
import { useAuthStore } from "@/store/useAuthStore"

function App() {
  const loadUser = useAuthStore((s) => s.loadUser)

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return <RouterProvider router={router} />
}

export default App
