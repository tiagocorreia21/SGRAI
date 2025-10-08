import * as THREE from "three";
import { merge } from "./merge.js";

/*
 * parameters = {
 *  color: Integer,
 *  radius: Float,
 *  speed: Float,
 *  directionMax: Float,
 * }
 */

export default class Ball extends THREE.Mesh {
    
    constructor(parameters, player1, player2, table) {
    
        super();
        merge(this, parameters);
        this.player1 = player1;
        this.player2 = player2;
        this.table = table;

        // Create the ball (a circle)
        this.geometry = new THREE.CircleGeometry(this.radius, 16);
        this.material = new THREE.MeshBasicMaterial({ color: this.color });

        this.initialize();
    }

    initialize() {
        this.center = new THREE.Vector2(0.0, THREE.MathUtils.randFloatSpread(this.table.size.y - 4.0 * this.radius));
        this.direction = THREE.MathUtils.randFloatSpread(2.0 * this.directionMax); // Direction in radians
        this.position.set(this.center.x, this.center.y);
    }

    update(deltaT) {

        const coveredDistance = this.speed * deltaT;

        const centerIncrement = new THREE.Vector2(
            coveredDistance * Math.cos(this.direction),
            coveredDistance * Math.sin(this.direction)
        );

        this.center.add(centerIncrement); 

        if (centerIncrement.x < 0.0) {  // The ball is moving to the left

            if (
                (this.center.x - this.radius) <= (this.player1.center.x + this.player1.halfSize.x) &&
                (this.center.x + this.radius) >= (this.player1.center.x - this.player1.halfSize.x) &&
                (this.center.y - this.radius) <= (this.player1.center.y + this.player1.halfSize.y) &&
                (this.center.y + this.radius) >= (this.player1.center.y - this.player1.halfSize.y)
            ) {

                // Reflect horizontally
                this.direction = Math.PI - this.direction;
                // Normalize to [0, 2π)
                this.direction = (this.direction + 2.0 * Math.PI) % (2.0 * Math.PI);
                // Push the ball outside the racket to avoid repeated collisions
                this.center.x = this.player1.center.x + this.player1.halfSize.x + this.radius + 1e-6;
            }

        }

        if (centerIncrement.x > 0.0) {

            if (
                (this.center.x + this.radius) >= (this.player2.center.x - this.player2.halfSize.x) &&
                (this.center.x - this.radius) <= (this.player2.center.x + this.player2.halfSize.x) &&
                (this.center.y - this.radius) <= (this.player2.center.y + this.player2.halfSize.y) &&
                (this.center.y + this.radius) >= (this.player2.center.y - this.player2.halfSize.y) 
            ) {

                // Reflect horizontally
                this.direction = Math.PI - this.direction;
                // Normalize to [0, 2π)
                this.direction = (this.direction + 2.0 * Math.PI) % (2.0 * Math.PI);
                // Push the ball outside the racket to avoid repeated collisions
                this.center.x = this.player2.center.x - this.player2.halfSize.x - this.radius - 1e-6;
            }
        }

        if (
            (centerIncrement.y < 0.0 && (this.center.y - this.radius) <= -this.table.halfSize.y) ||
            (centerIncrement.y > 0.0 && (this.center.y + this.radius) >= this.table.halfSize.y)
        ) {

            // Reflect vertical component
            this.direction = -this.direction;
            // Normalize to [0, 2π)
            this.direction = (this.direction + 2.0 * Math.PI) % (2.0 * Math.PI);

            // Push the ball inside the table bounds to avoid repeated collisions
            if (this.center.y - this.radius <= -this.table.halfSize.y) {
                this.center.y = -this.table.halfSize.y + this.radius + 1e-6;
            }
            else if (this.center.y + this.radius >= this.table.halfSize.y) {
                this.center.y = this.table.halfSize.y - this.radius - 1e-6;
            }
        }

        this.position.set(this.center.x, this.center.y);
    }
}
