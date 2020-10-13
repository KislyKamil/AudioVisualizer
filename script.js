let scene, camera, renderer, clock, planeGeometry, simplex, sound, analyser, plane, count, color;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const pause = document.getElementById('btn-stop');
const list = document.getElementById('list');
const theme = document.getElementById('colors');

let isRGB = true;

const path = [
  "https://media.hksns.com/wp-content/uploads/edd/2020/05/5ec6a6ca1bda89.83049059/HoldMyHand-FULL.mp3",
  "https://media.hksns.com/wp-content/uploads/edd/2020/05/5ec6b34262d159.49537186/BrownstoneBallad-FULL.mp3",
  "https://media.hksns.com/wp-content/uploads/edd/2020/05/5ec6ea313b5824.08023359/Spectrum-FULL.mp3",
  "https://media.hksns.com/wp-content/uploads/edd/2020/05/5ebc6963b40401.84073917/CommercialTake-FULL.mp3",
  "https://media.hksns.com/wp-content/uploads/edd/2020/05/5ebdbdba889328.91952098/Megabytes-FULL.mp3",
  "https://media.hksns.com/wp-content/uploads/edd/2020/04/5e8efc6841a7e6.91111795/IronHorse-FULL.mp3"
]
//https://media.hksns.com/wp-content/uploads/edd/2020/05/5eb20236d7ce71.15676530/BurnitDown-FULL.mp3
init();
pickSong();

function init() {
  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333399);

  camera = new THREE.PerspectiveCamera(45, ASPECT_RATIO, 1, 3000);
  camera.position.set(0, -1, 5);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);


  planeGeometry = new THREE.PlaneBufferGeometry(6, 6, 14, 14);
  count = planeGeometry.attributes.position.count;

  planeGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3, true));
  color = new THREE.Color();

  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    //flatShading: true,
    vertexColors: true,
  });

  plane = new THREE.Mesh(planeGeometry, material);
  plane.rotateX(-Math.PI / 3); // filp plane 
  scene.add(plane);

  simplex = new SimplexNoise(2);
  update();

  console.log(plane);

  pause.addEventListener('click', () => {
    if (sound) {
      if (sound.isPlaying) {
        sound.pause();
      } else {
        sound.play();
      }
    }
  })

}

function playSong(songName) {

  listener = new THREE.AudioListener();
  camera.add(listener);

  sound = new THREE.Audio(listener);


  const loader = new THREE.AudioLoader();

  //loader.setPath(assetsPath);
  loader.load(path[songName - 1], buffer => {

    sound.setBuffer(buffer);
    sound.play();
  });


  analyser = new THREE.AudioAnalyser(sound, 64);
};

window.addEventListener('resize', () => {

  camera.aspect = ASPECT_RATIO;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})

function update() {
  const time = clock.getElapsedTime();

  if (analyser) {

    const data = analyser.getFrequencyData();  // 0-255, in dB, first half is higher Frequencies and second is lower Frequencies
    const avgFr = analyser.getAverageFrequency();

    updateGround(planeGeometry, avgFr / 16, time);

  }
  requestAnimationFrame(update);
  renderer.render(scene, camera);

}

function updateGround(geometry, distortionFr, time) {

  const position = geometry.getAttribute('position');
  const colors = geometry.getAttribute('color');

  for (var i = 0; i < count; i++) {


    if (isRGB) {
      color.setRGB(0.1 + position.getZ(i), 0.8 - (position.getZ(i) + (distortionFr * 0.1)), 0.15);
    } else {
      color.setHSL(0.1 + position.getZ(i), distortionFr * 0.15, 0.5);
    }

    colors.setXYZ(i, color.r, color.g, color.b);
  }
  colors.needsUpdate = true;

  const amp = 0.1;
  for (let i = 0; i < position.array.length; i += 3) {

    const offset = simplex.noise2D(position.array[i] + time * 0.15, position.array[i + 1] + time * 0.15) * distortionFr * amp;
    position.array[i + 2] = offset;

   
  };

  position.needsUpdate = true;

}

function pickSong() {
  list.addEventListener('click', (event) => {
    if (sound) {
      if (sound.isPlaying) {
        sound.pause();
      }
    }
    playSong(event.target.id);
  })
};


theme.addEventListener('click', (e) => {
  let currentObj;

  if (e.target.getAttribute("class") === "RGB") {

    isRGB = true;
    currentObj = document.querySelector(".HSL-active");

    e.target.setAttribute('class', "RGB-active");

    if (currentObj !== null) currentObj.setAttribute('class', "HSL");

  }
  if (e.target.getAttribute("class") === "HSL") {
    isRGB = false;
    currentObj = document.querySelector(".RGB-active");

    e.target.setAttribute('class', "HSL-active");

    if (currentObj !== null) currentObj.setAttribute('class', "RGB");
  }

})