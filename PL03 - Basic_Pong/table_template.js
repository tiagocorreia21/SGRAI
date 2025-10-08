import * as THREE from "three";
import { merge } from "./merge.js";

/*
 * parameters = {
 *  color: Integer,
 *  size: Vector2,
 *  dashes: Integer
 * }
 */

export default class Table extends THREE.Group {

    constructor(parameters) {

        super();
        merge(this, parameters);
        this.halfSize = this.size.clone().divideScalar(2.0);

        // Create the table (a bottom line, a top line and the net)

        // Create the bottom line and the top line (two line segments)
        let points = [
            new THREE.Vector2(-this.halfSize.x, -this.halfSize.y),
            new THREE.Vector2(this.halfSize.x, -this.halfSize.y),
            new THREE.Vector2(-this.halfSize.x, this.halfSize.y),
            new THREE.Vector2(this.halfSize.x, this.halfSize.y),
        ];

        let geometry = new THREE.BufferGeometry().setFromPoints(points);

        let material = new THREE.LineBasicMaterial({ color: this.color });

        let lines = new THREE.LineSegments(geometry, material);

        this.add(lines);

        let points2 = [
            new THREE.Vector2(0.0, -this.halfSize.y),
            new THREE.Vector2(0.0, this.halfSize.y)
        ];    

        geometry = new THREE.BufferGeometry().setFromPoints(points2);
        
        const size = this.size.y / (2.0 * this.dashes - 1.0);
        
        material = new THREE.LineDashedMaterial({color : this.color, dashSize: size, gapSize: size});
        
        lines = new THREE.LineSegments(geometry, material);
        lines.computeLineDistances();
        
        this.add(lines); 
    }
}