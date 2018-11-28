# OT
operation generated on 1 site, executed locally immediately, broadcat to other site
- ensure causality, convergence, intention preservation
1. effect of executing any operation get same effect as original
2. execution effects of concurrent operations don't interfere

causality: order of operations to be executed

o1: A(+12)BCDE
o2: AB(xC)DE
-> if run o1, o2 in serial => A1BCDE
-> ideal result => A12BDE

traditional optimistic replication ensure convergence of replicas

# SDT
require vector clock, no need central site
vector clock don't scale
rely on just analyzing log of operations

# WOTT (Without Operational Transformation)
early instance of CRDT

A (+12) BCDE

instead of broadcast insert(2,"12") -> broadcast insert('A' < "12" < 'B')
'B' locally deleted == 'B' marked as invisible

each insert operation -> generate 2 new order (partial order)
each time operation received -> linearization done -> new state observed by user

## PCI Consistency model
1. Precondition preservation
operation integrated if preconditions are true
2. Convergence
same set of operation executed at all sites, all copies identical
3. Intention Preservation
effect: executing O at all site == executing O on generation state

Not require causality, oepration integrate as soon as preconditions true
- allow higher concurrency

## Data model
W-character = [id, v, a, id_cp, id_cn]
id: identifier
v: visibility of character
a: character value
id_cp: previoius W-char
id_cn: next W-char

character identifier = (ns, ng)
ns: identifier of site, ng: natural number

W-string = ordered sequence of W-characters c1, c2, ..., cn

## Orders
to obtain string from partial order -> find linear extension (total order)
when no precedence relation, order must set independently from state => use char identifier

## Complexity
size of local clock, site identifier = O(1)
space complexity: prop. k+m => O(n)

worst time complexity = O(n^3) -> improve to O(n^2) if maintain index of identifiers in W-String


# CRDT (conflict-free/commutative replicated data type)
1. define CRDT
2. based on state / operation
3. dfine boundary condition that satisfy eventual consistency
4. define what to be sufficient message to deduce final result
5. counter, register, set, graph
6. how to implement CRDT, on storage garbage collection

## eventual consistency
node receive message async
no need synchronisation, update execute immediately, ignore network latency
=> extremely scalable, fault-tolerant

not use consensus

## system model
atom = base immutable data type, (eg. integer, string, sets)
object = mutable, replicated data type













