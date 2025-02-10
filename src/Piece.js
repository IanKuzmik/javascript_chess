
class Piece {

    constructor( type, ctx, color, size, location ) {
        this.type = type;
        this.ctx = ctx;
        this.color = color;
        this.size = size;
        this.location = location;
        this.draw( location.x, location.y );
    }

    draw( x, y) {
        const size = this.size;
        const xCenter = x + size/2;
        const yCenter = y + size/2;

        this.ctx.beginPath() 
        switch(this.type) {
            case 'r':
            case 'R':
                this.ctx.moveTo( x, y); 
                this.ctx.lineTo( x + size, y);
                this.ctx.lineTo( x + size, y + size);
                this.ctx.lineTo( x, y + size);
                break;
            case 'n':
            case 'N':
                this.ctx.moveTo(xCenter, y-size*0.25); // top tip of diamond
                this.ctx.lineTo(x + size, yCenter);    // middle right point of diamond
                this.ctx.lineTo(xCenter, y+size*1.25); // bottom tip of diamond
                this.ctx.lineTo(x, yCenter);           // middle left point of diamond
                break;
            case 'b':
            case 'B':
                this.ctx.arc(x + size/2, y + size/2, size * 0.6, 0, 2 * Math.PI ); // xCenter, yCenter, radius, startAngle, endAngle
                break
            case 'q':
            case 'Q':
                this.ctx.moveTo(x + size * 0.5, y - size * 0.25); 
                this.ctx.lineTo(x + size * 0.75, y + size * 0.75);                                   
                this.ctx.lineTo(x + size * 1.3, y + size * 0.5 );  
                this.ctx.lineTo(x + size * 0.75, y + size * 0.25);  
                this.ctx.lineTo(x + size * 0.5, y + size * 1.25);  
                this.ctx.lineTo(x + size * 0.25, y + size * 0.25); 
                this.ctx.lineTo(x - size * 0.3, y + size * 0.5); 
                this.ctx.lineTo(x + size * 0.25, y + size * 0.75);  
                break;
            case 'k':
            case 'K':
                this.ctx.moveTo(x + size * 0.5, y + size * 1.25);
                this.ctx.lineTo( x + size * 0.6, y + size * 0.6 ); 
                this.ctx.lineTo( x + size * 1.25, y + size * 0.5);   
                this.ctx.lineTo( x + size * 0.5, y - size * 0.25); 
                this.ctx.lineTo( x + size * 0.4, y + size * 0.4);  
                this.ctx.lineTo( x - size * 0.25, y + size * 0.5);
                break; 
            case 'p':
            case 'P':
                this.ctx.moveTo(x + size/2, y);  // tip of triangle
                this.ctx.lineTo(x, y+size);      // lower left point of triangle
                this.ctx.lineTo(x+size, y+size); // lower right point of triangle
                break 
        }
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}

export default Piece;