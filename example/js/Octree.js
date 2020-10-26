function Octree( position, size ) {

	this.position = position !== undefined ? position : { x: 0, y: 0, z: 0 };
	this.size = size !== undefined ? size : { x: 1, y: 1, z: 1 };

	this.children = [];

	this.items = [];

}

Object.assign( Octree.prototype, {

	insert: function ( item ) {

		let index1 = this.getChildIndex( item.min );

		let index2 = this.getChildIndex( item.max );

		if ( index1 !== index2 ) {

			this.items.push( item );

			return;

		}

		if ( this.children.length > 0 ) {

			this.children[ index1 ].insert( item );

		} else {

			if ( this.items.length < 8 ) {

				this.items.push( item );

			} else {

				this.subdivide();

				this.children[ index1 ].insert( item );

			}

		}

	},

	query: function ( box, callback ) {

		for ( let i = 0; i < this.items.length; i ++ ) {

			let item = this.items[ i ];

			if ( ! ( item.max.x < box.min.x || item.min.x > box.max.x ||
				item.max.y < box.min.y || item.min.y > box.max.y ||
				item.max.z < box.min.z || item.min.z > box.max.z ) ) {

				callback( item ); 

			}

		}

		for ( let i = 0; i < this.children.length; i ++ ) {

			let node = this.children[ i ];

			if ( node.position.x + node.size.x / 2 > box.min.x && node.position.x - node.size.x / 2 < box.max.x &&
				node.position.y + node.size.y / 2 > box.min.y && node.position.y - node.size.y / 2 < box.max.y &&
				node.position.z + node.size.z / 2 > box.min.z && node.position.z - node.size.z / 2 < box.max.z ) {

				node.query( box, callback );

			}

		}

	},

	subdivide: function () {

		let halfSizeX = this.size.x / 2;
		let halfSizeY = this.size.y / 2;
		let halfSizeZ = this.size.z / 2;

		for ( let i = 0; i < 8; i ++ ) {

			let x = i % 4 < 2 ? - halfSizeX / 2 : halfSizeX / 2;

			let y = ( i + 1 ) % 4 < 2 ? halfSizeY / 2 : - halfSizeY / 2;

			let z = i < 4 ? - halfSizeZ / 2 : halfSizeZ / 2;

			this.children[ i ] = new Octree(
				{
					x: this.position.x + x,
					y: this.position.y + y,
					z: this.position.z + z
				},
				{
					x: halfSizeX,
					y: halfSizeY,
					z: halfSizeZ
				}
			);

		}

		let items = this.items;

		this.items = [];

		for ( let i = 0; i < items.length; i ++ ) {

			this.insert( items[ i ] );

		}

	},

	getChildIndex: function ( position ) {

		/* order of the children nodes

		0      3

			4       7


		1      2

			5       6

		*/

		let index = 0;

		if ( position.x > this.position.x ) {

			index += 2;

			if ( position.y > this.position.y ) {

				index += 1;

			}

		} else if ( position.y < this.position.y ) {

			index += 1;

		}	

		if ( position.z > this.position.z ) {

			index += 4;

		}

		return index;

	},

	traverse: function ( callback ) {

		callback( this );

		for ( let i = 0; i < this.children.length; i ++ ) {

			this.children[ i ].traverse( callback );

		}

	}

} );

if ( typeof module === 'object' ) {

	module.exports = Octree;

}