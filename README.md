# Oriented Bounding Box

Collision handler for oriented bounding boxes using SAT. [Live Demo](https://bytezeroseven.github.io/OBB)

## Example #1: Detecting/Resolving collision
```js
let position = {
	x: 0,
	y: 2.5,
	z: - 20
};

let rotation = {
	x: 0,
	y: Math.PI / 4,
	z: Math.PI / 6
};

let size = {
	x: 10,
	y: 5,
	z: 15
};

let box1 = new OBB( position, rotation, size );

let box2 = new OBB();

box2.position.z = - 20;

// important! always do it after changing the transformations 
// (or forcefully update the box while checking for intersection)

box2.update(); 

let intersection = box1.intersectsObb( box2 );

if ( intersection !== false ) {

	console.log( 'intersects!' );

	box1.position.x += intersection.vector.x * intersection.overlap;
	box1.position.y += intersection.vector.y * intersection.overlap;
	box1.position.z += intersection.vector.z * intersection.overlap;

}
```

## Cheatsheet

```js
// properties
OBB.prototype.position;
OBB.prototype.rotation; // euler
OBB.prototype.size;
OBB.prototype.vertices;

// methods
OBB.prototype.intersectsObb( obb, forceUpdate );
OBB.prototype.update();
OBB.prototype.updateBasis();
OBB.prototype.updateVertices();
```