import { Link, Outlet, NavLink, useLocation } from 'react-router-dom'

export default function Layout() {
	const location = useLocation()
	const inDuel = location.pathname === '/play'

	return (
		<div className={inDuel ? 'layout duel-layout' : 'layout'}>
			{!inDuel && (
				<header className="nav">
					<Link to="/" className="brand">GOAT ONLINE</Link>
					<nav>
						<NavLink to="/lobby">Play</NavLink>
						<NavLink to="/decks">Deck Builder</NavLink>
						<NavLink to="/database">Cards</NavLink>
						<NavLink to="/effects">Effects</NavLink>
						<NavLink to="/settings">Settings</NavLink>
					</nav>
				</header>
			)}
			<main className={inDuel ? 'duel-main' : ''}>
				<Outlet />
			</main>
		</div>
	)
}
