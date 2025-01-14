import * as THREE from 'three';

const clock = new THREE.Clock();
const vertexShader = `varying vec2 vUv;
void main()
{
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}`
const fragmentShader = `uniform vec2 resolution;
uniform float time;
varying vec2 vUv;
void main(void)
{
    vec2 p = -1.0 + 2.0 * vUv;
    float a = time*40.0;
    float d,e,f,g=1.0/40.0,h,i,r,q;
    e=400.0*(p.x*0.5+0.5);
    f=400.0*(p.y*0.5+0.5);
    i=200.0+sin(e*g+a/150.0)*20.0;
    d=200.0+cos(f*g/2.0)*18.0+cos(e*g)*7.0;
    r=sqrt(pow(i-e,2.0)+pow(d-f,2.0));
    q=f/r;
    e=(r*cos(q))-a/2.0;f=(r*sin(q))-a/2.0;
    d=sin(e*g)*176.0+sin(e*g)*164.0+r;
    h=((f+d)+a/2.0)*g;
    i=cos(h+r*p.x/1.3)*(e+e+a)+cos(q*g*6.0)*(r+h/3.0);
    h=sin(f*g)*144.0-sin(e*g)*212.0*p.x;
    h=(h+(f-e)*q+sin(r-(a+h)/7.0)*10.0+i/4.0)*g;
    i+=cos(h*2.3*sin(a/350.0-q))*184.0*sin(q-(r*4.3+a/12.0)*g)+tan(r*g+h)*184.0*cos(r*g+h);
    i=mod(i/5.6,256.0)/64.0;
    if(i<0.0) i+=4.0;
    if(i>=2.0) i=4.0-i;
    d=r/350.0;
    d+=sin(d*d*8.0)*0.52;
    f=(sin(a*g)+1.0)/2.0;
    gl_FragColor=vec4(vec3(f*i/1.6,i/2.0+d/13.0,i)*d*p.x+vec3(i/1.3+d/8.0,i/2.0+d/18.0,i)*d*(1.0-p.x),1.0);
}`

class PhotoshopScene {

    state: any = {}
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    shouldRender: boolean = false;
    container?: HTMLDivElement;
    light: THREE.PointLight;
    uniforms = {
        time: {
            type: "f",
            value: 300.0
        },
        resolution: {
            type: "v2",
            value: new THREE.Vector2()
        }
    };
    mainSphere: THREE.Mesh
    basicMaterial: THREE.Material = new THREE.MeshBasicMaterial({ color: 0xe157be })
    shaderMaterial: THREE.Material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader,
        fragmentShader
    });

    setState (values: any) {
        this.state = {
            ...this.state,
            ...values
        }
        this.animate()
    }

    get width () {
        if (this.container) return this.container.clientWidth
        return 1;
    }

    get height () {
        if (this.container) return this.container.clientHeight
        return 1;
    }

    get aspect () {
        return this.width / this.height
    }

    addSphere () {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = this.basicMaterial
        const mesh = new THREE.Mesh( geometry, material );
        this.scene.add(mesh);
        return mesh;
    }

    constructor () {
        this.camera = new THREE.PerspectiveCamera( 70, this.aspect, 0.01, 10);
        this.camera.position.z = 3;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111)
        this.mainSphere = this.addSphere()

        this.light = new THREE.PointLight(0xff0000, 10, 20)
        this.light.position.set(10, 10, 12)
        this.scene.add(this.light)

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );

        window.addEventListener('resize', this.resize.bind(this));
    }
    
    init (container: HTMLDivElement) {
        this.container = container
        this.container.appendChild(this.renderer.domElement);
        this.resize()
        this.animate()
    }

    play () {
        this.shouldRender = true;
        this.animate()
    }

    pause () {
        this.shouldRender = false;
    }

    animate () {
        if (this.shouldRender) {
            requestAnimationFrame(this.animate.bind(this))
            const delta = clock.getDelta();
            this.uniforms.time.value += delta * 5;
        }
        this.mainSphere.visible = Boolean(this.state.draw)
        this.mainSphere.material = Boolean(this.state.shader) ? this.shaderMaterial : this.basicMaterial
        this.renderer.render(this.scene, this.camera)
    }
    
    resize () {
        this.renderer.setSize(this.width, this.height);
        this.uniforms.resolution.value.x = this.width;
        this.uniforms.resolution.value.y = this.height;
        this.camera.aspect = this.aspect;
        this.camera.updateProjectionMatrix();
    }

}

export default PhotoshopScene