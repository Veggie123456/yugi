export const hoverLift = {
	whileHover: { y: -4, scale: 1.02 },
	transition: { type: 'spring', stiffness: 300, damping: 20 }
}

export const fadeIn = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	transition: { duration: 0.2 }
}

export const flipIn = {
	initial: { rotateY: 90, opacity: 0 },
	animate: { rotateY: 0, opacity: 1 },
	transition: { type: 'spring', stiffness: 180, damping: 16 }
}


