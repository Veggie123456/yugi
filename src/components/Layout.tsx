import { Link, Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
	return (
		<div className="layout">
			<header className="nav">
				<Link to="/" className="brand">GOAT ONLINE</Link>
				<nav>
					<NavLink to="/lobby">Play</NavLink>
					<NavLink to="/decks">Deck Builder</NavLink>
					<NavLink to="/database">Cards</NavLink>
					<NavLink to="/settings">Settings</NavLink>
				</nav>
			</header>
			<main>
				<Outlet />
			</main>
		</div>
	)
}
