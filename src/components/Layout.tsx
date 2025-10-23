import { Link, Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
	return (
		<div className="layout">
			<header className="nav">
				<Link to="/" className="brand">GOAT Duel</Link>
				<nav>
					<NavLink to="/play">Play</NavLink>
					<NavLink to="/decks">Decks</NavLink>
					<NavLink to="/database">Database</NavLink>
					<NavLink to="/settings">Settings</NavLink>
				</nav>
			</header>
			<main>
				<Outlet />
			</main>
		</div>
	)
}


