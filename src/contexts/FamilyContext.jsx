import { createContext, useContext, useState, useEffect } from 'react'

const FamilyContext = createContext(null)

const FAMILY_ID_KEY = 'spelling-collector-family-id'

export function FamilyProvider({ children }) {
  const [familyId, setFamilyIdState] = useState(() => {
    return localStorage.getItem(FAMILY_ID_KEY)
  })

  const setFamilyId = (id) => {
    if (id) {
      localStorage.setItem(FAMILY_ID_KEY, id)
    } else {
      localStorage.removeItem(FAMILY_ID_KEY)
    }
    setFamilyIdState(id)
  }

  return (
    <FamilyContext.Provider value={{ familyId, setFamilyId }}>
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const context = useContext(FamilyContext)
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider')
  }
  return context
}
