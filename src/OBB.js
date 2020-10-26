function OBB( position, rotation, size ) {

	this.position = position || { x: 0, y: 0, z: 0 };
	this.rotation = rotation || { x: 0, y: 0, z: 0, order: 'XYZ' };
	this.size = size || { x: 1, y: 1, z: 1 };

	this.update();

}

Object.assign( OBB.prototype, {

	update: function () {

		// update basis

		let cosA = Math.cos( this.rotation.x );
		let cosB = Math.cos( this.rotation.y );
		let cosC = Math.cos( this.rotation.z );
		
		let sinA = Math.sin( this.rotation.x );
		let sinB = Math.sin( this.rotation.y );
		let sinC = Math.sin( this.rotation.z );

		// XYZ

		this.right = {
			x: cosB * cosC,
			y: sinA * sinB * cosC + cosA * sinC,
			z: - cosA * sinB * cosC + sinA * sinC
		};

		this.up = {
			x: - cosB * sinC,
			y: - sinA * sinB * sinC + cosA * cosC,
			z: cosA * sinB * sinC + sinA * cosC
		};
		
		this.forward = {
			x: sinB,
			y: - sinA * cosB,
			z: cosA * cosB
		};

		// ZYX

		/*this.right = {
			x: cosC * cosB - sinC * sinA * sinB,
			y: sinC * cosB + cosC * sinA * sinB,
			z: - cosA * sinB
		};

		this.up = {
			x: - sinC * cosA,
			y: cosC * cosA,
			z: sinA
		};
		
		this.forward = {
			x: cosC * sinB + sinC * sinA * cosB,
			y: sinC * sinB - cosC * sinA * cosB,
			z: cosA * cosB
		};*/

		// update vertices

		this.vertices = [];

		this.boundingBox = {
			min: { 
				x: Infinity, 
				y: Infinity, 
				z: Infinity 
			},
			max: { 
				x: - Infinity, 
				y: - Infinity, 
				z: - Infinity 
			},
			obb: this
		};

		for ( let i = 0; i < 8; i ++ ) {

			let x = i % 4 < 2 ? - this.size.x / 2 : this.size.x / 2;

			let y = ( i + 1 ) % 4 < 2 ? this.size.y / 2 : - this.size.y / 2;

			let z = i < 4 ? - this.size.z / 2 : this.size.z / 2;

			let position = {
				x: this.position.x + x * this.right.x + y * this.up.x + z * this.forward.x,
				y: this.position.y + x * this.right.y + y * this.up.y + z * this.forward.y,
				z: this.position.z + x * this.right.z + y * this.up.z + z * this.forward.z,
			};

			this.vertices.push( position );

			this.boundingBox.min.x = Math.min( position.x, this.boundingBox.min.x );
			this.boundingBox.min.y = Math.min( position.y, this.boundingBox.min.y );
			this.boundingBox.min.z = Math.min( position.z, this.boundingBox.min.z );

			this.boundingBox.max.x = Math.max( position.x, this.boundingBox.max.x );
			this.boundingBox.max.y = Math.max( position.y, this.boundingBox.max.y );
			this.boundingBox.max.z = Math.max( position.z, this.boundingBox.max.z );

		}

	},

	intersectsObb: function ( obb, forceUpdate ) {

		if ( forceUpdate === true ) {

			this.update();

			obb.update();

		}

		if ( this.boundingBox.max.x < obb.boundingBox.min.x || this.boundingBox.min.x > obb.boundingBox.max.x ||
			this.boundingBox.max.y < obb.boundingBox.min.y || this.boundingBox.min.y > obb.boundingBox.max.y ||
			this.boundingBox.max.z < obb.boundingBox.min.z || this.boundingBox.min.z > obb.boundingBox.max.z ) {

			return false;

		}

		let axes = [
			this.right, 
			this.up, 
			this.forward, 
			obb.right, 
			obb.up, 
			obb.forward,
			crossAndNormalize( this.right, obb.right ),
			crossAndNormalize( this.right, obb.up ),
			crossAndNormalize( this.right, obb.forward ),
			crossAndNormalize( this.up, obb.right ),
			crossAndNormalize( this.up, obb.up ),
			crossAndNormalize( this.up, obb.forward ),
			crossAndNormalize( this.forward, obb.right ),
			crossAndNormalize( this.forward, obb.up ),
			crossAndNormalize( this.forward, obb.forward ),
		];

		let minOverlap = Infinity;
		let vector = null;

		for ( let i = 0; i < axes.length; i ++ ) {

			let axis = axes[ i ];

			if ( axis.x === 0 && axis.y === 0 && axis.z === 0 ) {

				continue;

			}

			let a_min = Infinity;
			let a_max = - Infinity;

			let b_min = Infinity;
			let b_max = - Infinity;

			for ( let i = 0; i < 8; i ++ ) {

				let projection = dot( this.vertices[ i ], axis );

				if ( projection < a_min ) {

					a_min = projection;

				}

				if ( projection > a_max ) {

					a_max = projection;

				}

				projection = dot( obb.vertices[ i ], axis );

				if ( projection < b_min ) {

					b_min = projection;

				}

				if ( projection > b_max ) {

					b_max = projection;

				}

			}

			let overlap = Math.min( a_max, b_max ) - Math.max( a_min, b_min );

			if ( overlap > 0 ) {

				if ( overlap < minOverlap ) {

					minOverlap = overlap;
					vector = axis;

				}

			} else {

				return false;

			}

		}

		let amount = vector.x * ( this.position.x - obb.position.x ) + vector.y * ( this.position.y - obb.position.y ) + vector.z * ( this.position.z - obb.position.z );

		if ( amount < 0 ) {

			vector.x *= - 1;
			vector.y *= - 1;
			vector.z *= - 1;

		}

		return {
			overlap: minOverlap,
			vector: vector
		};

	}

} );

function dot( a, b ) {

	return a.x * b.x + a.y * b.y + a.z * b.z;

}

function crossAndNormalize( a, b ) {

	let result = {
		x: a.y * b.z - a.z * b.y,
		y: a.z * b.x - a.x * b.z,
		z: a.x * b.y - a.y * b.x 
	};

	let length = Math.hypot( result.x, result.y, result.z );

	if ( length !== 0 ) {

		result.x /= length;
		result.y /= length;
		result.z /= length;

	}

	return result;

}

if ( typeof module === 'object' ) {

	module.exports = OBB;

}