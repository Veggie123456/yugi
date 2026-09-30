import { Link, Outlet, NavLink, useLocation } from 'react-router-dom'

export default function Layout() {
	const location = useLocation()
	const inDuel = location.pathname === '/play'
	const onHome = location.pathname === '/'

	return (
		<div className={inDuel ? 'layout duel-layout' : onHome ? 'layout home-layout' : 'layout'}>
			{!inDuel && (
				<header className={onHome ? 'nav home-nav' : 'nav'}>
					<Link to="/" className="brand">DUELIST ISLAND</Link>
					<nav>
						<NavLink to="/lobby">Play</NavLink>
						<NavLink to="/decks">Deck Builder</NavLink>
						<NavLink to="/database">Cards</NavLink>
						<NavLink to="/effects">Effects</NavLink>
						<NavLink to="/settings">Settings</NavLink>
					</nav>
				</header>
			)}
			<main className={inDuel ? 'duel-main' : onHome ? 'home-main' : ''}>
				<Outlet />
			</main>
		</div>
	)
}
