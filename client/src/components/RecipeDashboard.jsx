export default function RecipeDashboard({ session, onSignOut }) {
  const displayName =
    session.user.user_metadata?.username ||
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    session.user.email

  return (
    <main>
      <h1>My Recipes</h1>
      <p>Welcome, {displayName}</p>

      <button onClick={onSignOut}>Sign out</button>

      <section>
        <h2>Your recipes</h2>
        <p>No recipes yet. Create your first recipe soon.</p>
      </section>
    </main>
  )
}