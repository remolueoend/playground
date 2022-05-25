abstract sig FSObject {
	// parent: lone Dir
}

sig Dir extends FSObject {
	// contents: set FSObject
}

sig File extends FSObject {}

// global state representing a file system:
sig FileSystem {
	live: set FSObject, // objects part of this system
	root: one Dir & live,
	parent:  (live - root) -> one (Dir & live),
	contents: (Dir & live) -> set live
}

/**
 * invariant which needs to hold after any file system
 * manipulations.
 */
pred inv[s: FileSystem] {
	s.contents = ~(s.parent) &&
	s.live in s.root.*(s.contents)
}

/**
 * initial state of a file system (single empty root).
 */
pred init[s: FileSystem] {
	#s.live = 1 &&
	s.contents[s.root] = none
}
assert init_etab {
	all s : FileSystem | init[s] => inv[s]
}
check init_etab



/**
 * remove a file or directory from a file system.
 */
pred rmObj[s, s2 : FileSystem, o: FSObject] {
	o in s.live - s.root &&
	// s.contents = {(d1, f1), (d1, f2), (d1, d2), (d2, f3), ...}
	// *(s.contents) = {(d1, d1), (f1, f1), ..., (d1, f1), (d1, f2), (d1, d2), (d2, f3), (d1, f3), ...}
	// if o = d2, o.*(s.contents) = {(d2), (f3), ...}
	s2.live = s.live - o.*(s.contents) &&
	s2.parent = s2.live <: s.parent &&
	s2.contents = s.contents :> s2.live
}
assert removeObj_inv {
	all s, s2 : FileSystem, o : FSObject |
	inv[s] && rmObj[s, s2, o] => inv[s2]
}
check removeObj_inv
run rmObj



/**
 * add a new object under a directory to a file system.
 */
pred addObj[s, s2 : FileSystem, d: Dir, o: FSObject] {
	o not in s.live && d in s.live && d != o
	s2.live = s.live + o
	&& s2.parent = s.parent + (o -> d)
	&& s2.contents = s.contents + (d -> o)
}
assert addObj_inv {
	all s, s2 : FileSystem, d : Dir, o : FSObject |
	inv[s] && addObj[s, s2, d, o] => inv[s2]
}
check addObj_inv
run addObj
