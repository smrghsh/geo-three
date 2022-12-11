var canvas = document.getElementById("canvas");

var scenes = [createWorldScene(), createMapScene()];

var active = 0;


var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

function createWorldScene() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    var loader = new THREE.TextureLoader();
    loader.load('texture.jpg', function(texture) {
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(Geo.UnitsUtils.EARTH_RADIUS, 128, 128), new THREE.MeshBasicMaterial({
            map: texture
        }));
        scene.add(sphere);
    });
    
    var camera = new THREE.PerspectiveCamera(60, 1, 0.01, 1e8);
    
    var controls = new THREE.MapControls(camera, canvas);
    controls.minDistance = Geo.UnitsUtils.EARTH_RADIUS + 3e4;
    controls.maxDistance = Geo.UnitsUtils.EARTH_RADIUS * 1e1;
    controls.enablePan = false;
    controls.zoomSpeed = 1.0;
    controls.rotateSpeed = 0.3; 
    camera.position.set(0, 0, Geo.UnitsUtils.EARTH_RADIUS);

    return {camera: camera, controls: controls, scene: scene};
}

function createMapScene() {
    var camera = new THREE.PerspectiveCamera(60, 1, 0.01, 1e12);

    var controls = new THREE.OrbitControls(camera, canvas);
    controls.minDistance = 1.0;
    controls.maxDistance = 1.0;
    controls.zoomSpeed = 2.0;
    camera.position.set(0, 0, 100);

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x444444);

    var map = new Geo.MapView(Geo.MapView.PLANAR, new Geo.OpenStreetMapsProvider());
    scene.add(map);
    map.updateMatrixWorld(true);

    var coords = Geo.UnitsUtils.datumsToSpherical(40.940119, -8.535589);
    controls.target.set(coords.x, 0, -coords.y);
    camera.position.set(0, 1000, 0);

    scene.add(new THREE.AmbientLight(0x777777));

    return {camera: camera, controls: controls, scene: scene};
}


var raycaster = new THREE.Raycaster();

document.body.onresize = function()
{
    const s = scenes[active];
    
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    
    s.camera.aspect = width / height;
    s.camera.updateProjectionMatrix();
}
document.body.onresize();

const pointer = new THREE.Vector2();
window.addEventListener('pointermove', function (event) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
});

window.addEventListener('dblclick', function (event) {
    const intersects = raycaster.intersectObjects(worldScene.children);
    console.log('Raycasting intersections', intersects);
    if (intersects.length > 0) {
        const pos = Geo.UnitsUtils.vectorToDatums(intersects[0].point);
        console.log(pos);
    }
    
});

function animate()
{
    requestAnimationFrame(animate);
    
    const s = scenes[active];

    raycaster.setFromCamera(pointer, s.camera);

    s.controls.update();
    
    renderer.render(s.scene, s.camera);
}
animate();