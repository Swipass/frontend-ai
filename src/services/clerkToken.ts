// src/services/clerkToken.ts
export async function getClerkToken(): Promise<string | null> {
  // Wait up to 2 seconds for Clerk to become available
  let attempts = 0
  while (!(window as any).Clerk && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }

  const clerk = (window as any).Clerk
  if (!clerk) return null

  try {
    const session = clerk.session
    if (!session) return null
    return await session.getToken()
  } catch {
    return null
  }
}