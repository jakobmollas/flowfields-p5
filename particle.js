'use strict'

class Particle {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector();
        this.maxSpeed = random(2, 7);
        this.size = 3.0;
    }

    draw() {
        push();

        noSmooth();
        colorMode(HSB, 100);

        let normalizedHeading = (this.velocity.heading() + PI) / (2 * PI);
        let normalizedSpeed = this.velocity.mag() / this.maxSpeed;
        fill(100 * normalizedHeading, 0, 100 * normalizedSpeed);
        stroke(100 * normalizedHeading, 100, 100, 100 * normalizedSpeed);
        strokeWeight(2.5);

        // Draw a triangle rotated in the direction of velocity
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading() - HALF_PI);
        triangle(0, this.size * 2, this.size, -this.size * 2, -this.size, -this.size * 2);

        pop();
    }

    update(vectors, sclx, scly) {
        let steering = this.follow(vectors, sclx, scly);

        this.velocity.add(steering);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);

        this.wraparoundIfNeeded();
    }

    follow(vectors, sclx, scly) {
        let x = floor(this.position.x / sclx);
        let y = floor(this.position.y / scly);
        let index = x + y * scly;
        let force = vectors[index];

        return force;
    };

    wraparoundIfNeeded() {
        if (this.position.x < -this.size)
            this.position.x = width - this.size * 5;
        else if (this.position.x > width + this.size)
            this.position.x = this.size * 5;

        if (this.position.y < -this.size)
            this.position.y = height - this.size * 5;
        else if (this.position.y > height + this.size)
            this.position.y = this.size * 5;
    }
}