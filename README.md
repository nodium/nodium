# nodium
Nodium is a graph visualisation tool made with d3. It comes with adapters for Neo4j v1 and v2 databases out of the box.

# Manual

#### NOTE: This software is in pre-pre-alpha state. Do not use on important graphs.
It also may set unwanted properties on your nodes to keep track of its visual representation.

## Running

To get this project running, do the following

* Download the project (obviously)
* Get a Neo4j database running (locally, for now). This can be an empty database
* Open `index.html` in the root folder, preferably in Chrome

You are now able to directly modify the contents of your Neo4j database.

## Using

A short guide of the default actions

To create a node, press and hold the left mouse button anywhere on the canvas.

To select (and modify) a node, click it. The edit panel will open on the right.

To link nodes, drag them over each other.

Zooming is done using the mouse wheel

To pan the graph, just drag the canvas

Clicking and holding a node allows four other actions

* drag right: set the node's status property to "accepted"
* drag left: set the node's status property to "denied"
* drag up: fix the location of the node
* drag down: surprise

## Project structure

// TODO