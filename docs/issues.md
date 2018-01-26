# Pathfinding breaks when multiple minions are building

The main issue we're finding is that when the minions build a entire cluster the cluster can't resolve paths between it's own remaining tiles:

How to reproduce:

- Build the inner tiles of a cluster
- Build two opposite remaining tiles to divide the cluster in two
- Build in the two separated sides so the minion should walk from one to the other one
