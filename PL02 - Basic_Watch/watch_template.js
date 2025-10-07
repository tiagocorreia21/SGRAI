import * as THREE from "three";

export default class Watch extends THREE.Group {
    constructor(cityName, center = new THREE.Vector2(0.0, 0.0), radius = 0.75, nameBackgroundColor = 0xffffff, nameForegroundColor = 0x000000, dialColor = 0x000000, markersColor = 0xffffff, handsHMColor = 0xffffff, handSColor = 0xff0000) {
        
        super();

        this.cities = [
            { name: "Oporto", timeZone: "Europe/Lisbon" },
            { name: "Paris", timeZone: "Europe/Paris" },
            { name: "Helsinki", timeZone: "Europe/Helsinki" },
            { name: "Beijing", timeZone: "Asia/Shanghai" },
            { name: "Tokyo", timeZone: "Asia/Tokyo" },
            { name: "Sydney", timeZone: "Australia/Sydney" },
            { name: "Los Angeles", timeZone: "America/Los_Angeles" },
            { name: "New York", timeZone: "America/New_York" },
            { name: "Rio de Janeiro", timeZone: "America/Sao_Paulo" },
            { name: "Reykjavik", timeZone: "Atlantic/Reykjavik" }
        ];

        this.cityIndex = 0;
        const numberOfCities = this.cities.length;
        
        while (this.cityIndex < numberOfCities && cityName != this.cities[this.cityIndex].name) {
            this.cityIndex++;
        }
        if (this.cityIndex == numberOfCities) {
            this.cityIndex = 0;
        }

        // Set the time format for the specified city
        this.setTimeFormat(this.cityIndex);

        //1
        let geometry  = new THREE.CircleGeometry(radius, 60);
        let material  = new THREE.MeshBasicMaterial({ color: dialColor });
        this.dial = new THREE.Mesh(geometry, material);
        this.add(this.dial); 

        //2
        const radius0 = 0.85 * radius;
        const radius1 = 0.90 * radius;
        const radius2 = 0.95 * radius; 
        let points = [];
        
        // Create 12 hour markers
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6; // 30 degrees apart
            const x1 = radius1 * Math.cos(angle);
            const y1 = radius1 * Math.sin(angle);
            const x2 = radius2 * Math.cos(angle);
            const y2 = radius2 * Math.sin(angle);
            points.push(new THREE.Vector2(x1, y1));
            points.push(new THREE.Vector2(x2, y2));
        }
        
        geometry = new THREE.BufferGeometry().setFromPoints(points);
        material = new THREE.LineBasicMaterial({ color: markersColor });
        this.markers = new THREE.LineSegments(geometry, material);
        this.add(this.markers); 

        /* To-do #3: Create the hour hand (a line segment) with length 0.5 * radius, pointing at 0.0 radians (the positive X-semiaxis) and color handsHMColor*/
        points = [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.5 * radius, 0.0)];
        geometry = new THREE.BufferGeometry().setFromPoints(points);
        material = new THREE.LineBasicMaterial({ color: handsHMColor });
        this.handH = new THREE.LineSegments(geometry, material);
        this.add(this.handH); 

        /* To-do #4: Create the minute hand (a line segment) with length 0.7 * radius, pointing at 0.0 radians (the positive X-semiaxis) and color handsHMColor*/
        points = [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.7 * radius, 0.0)];
        geometry = new THREE.BufferGeometry().setFromPoints(points);
        material = new THREE.LineBasicMaterial({ color: handsHMColor });
        this.handM = new THREE.LineSegments(geometry, material);
        this.add(this.handM);

        // Create the second hand (a line segment and a circle) pointing at 0.0 radians (the positive X-semiaxis)
        this.handS = new THREE.Group();

        // Create the line segment
        points = [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.8 * radius, 0.0)];
        geometry = new THREE.BufferGeometry().setFromPoints(points);
        material = new THREE.LineBasicMaterial({ color: handSColor });
        let handS = new THREE.LineSegments(geometry, material);
        this.handS.add(handS);

        // Create the circle
        geometry = new THREE.CircleGeometry(0.03 * radius, 16);
        material = new THREE.MeshBasicMaterial({ color: handSColor });
        handS = new THREE.Mesh(geometry, material);
        this.handS.add(handS);

        this.add(this.handS);

        // Set the watch position
        this.position.set(center.x, center.y);

        // Create one HTML <div> element

        // Start by getting a "container" <div> element with the top-left corner at the center of the viewport (the origin of the coordinate system)
        const container = document.getElementById("container");

        // Then create a "label" <div> element and append it as a child of "container"
        this.label = document.createElement("div");
        this.label.style.position = "absolute";
        this.label.style.left = (50.0 * center.x - 30.0 * radius).toString() + "vmin";
        this.label.style.top = (-50.0 * center.y + 54.0 * radius).toString() + "vmin";
        this.label.style.width = (60.0 * radius).toString() + "vmin";
        this.label.style.fontSize = (8.0 * radius).toString() + "vmin";
        this.label.style.backgroundColor = "#" + new THREE.Color(nameBackgroundColor).getHexString();
        this.label.style.color = "#" + new THREE.Color(nameForegroundColor).getHexString();
        this.label.innerHTML = this.cities[this.cityIndex].name;
        container.appendChild(this.label);
    }

    setTimeFormat(cityIndex) {
        // One could use the toLocaleTimeString() method of the Date() object to determine the time in a given city, but this approach is potentially inefficient, since it has to perform a search in a big database of localization strings. When the method is called many times (as it would happen in method update()) with the same arguments, it is better to create a Intl.DateTimeFormat object and use its format() method: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString
        this.timeFormat = new Intl.DateTimeFormat("en-US", { timeZone: this.cities[cityIndex].timeZone, hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
    }

    update() {
        // Check the comment in the setTimeFormat() method
        const time = this.timeFormat.format(new Date()).split(":").map(Number); // Hours: time[0]; minutes: time[1]; seconds: time[2]

        // Compute the second hand angle
        let angle = Math.PI / 2.0 - 2.0 * Math.PI * time[2] / 60.0;
        this.handS.rotation.z = angle;

        /* To-do #5 - Compute the minute hand angle. It depends mostly on the current minutes value (time[1]), but you will get a more accurate result if you make it depend on the seconds value (time[2]) as well.*/
        angle = Math.PI / 2.0 - 2.0 * Math.PI * (time[1] + time[2] / 60.0) / 60.0;
        this.handM.rotation.z = angle; 

        /* To-do #6 - Compute the hour hand angle. It depends mainly on the current hours value (time[0]). Nevertheless, you will get a much better result if you make it also depend on the minutes and seconds values (time[1] and time[2] respectively).*/
        angle = Math.PI / 2.0 - 2.0 * Math.PI * (time[0] % 12 + time[1] / 60.0 + time[2] / 3600.0) / 12.0;
        this.handH.rotation.z = angle;
    }
}