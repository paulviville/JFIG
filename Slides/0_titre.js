import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import * as Display from '../CMapJS/Utils/Display.js';
import * as Hand from '../Files/hand_files.js';
import {loadGraph} from '../CMapJS/IO/GraphFormats/GraphIO.js';
import {loadIncidenceGraph} from '../CMapJS/IO/IncidenceGraphFormats/IncidenceGraphIO.js';
import {loadCMap2} from '../CMapJS/IO/SurfaceFormats/CMap2IO.js';
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer, scafEdgeMaterial, meshEdgeMaterial, ambiantLightInt, pointLightInt} from './parameters.js';



export const slide_titre = new Slide(
	function(DOM_Hand0, DOM_Hand1, DOM_Hand2, DOM_Hand3, DOM_Hand4)
	{
		this.camera = new THREE.PerspectiveCamera(75, DOM_Hand0.width / DOM_Hand0.height, 0.1, 1000.0);
		this.camera.position.set(0, 0, 1.4);
		// this.camera.position.set(0, 0.69, 0.39);
		// this.camera.lookAt(0, 0, 0);

		const surfaceLayer = 0;
		const skelLayer = 1;
		const scafLayer = 2;
		const rawLayer = 3;
		const raw2Layer = 4;
		const meshLayer = 5;

		const contextHand0 = DOM_Hand0.getContext('2d');
		const contextHand1 = DOM_Hand1.getContext('2d');
		const contextHand2 = DOM_Hand2.getContext('2d');
		const contextHand3 = DOM_Hand3.getContext('2d');
		const contextHand4 = DOM_Hand4.getContext('2d');

		const controlsHand0 = new OrbitControls(this.camera, DOM_Hand0);

		this.scene = new THREE.Scene()
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiantLightInt);
		const pointLight = new THREE.PointLight(0xFFFFFF, pointLightInt);
		pointLight.position.set(10,8,15);

		ambiantLight.layers.enable(surfaceLayer);
		pointLight.layers.enable(surfaceLayer);
		ambiantLight.layers.enable(skelLayer);
		pointLight.layers.enable(skelLayer);
		ambiantLight.layers.enable(scafLayer);
		pointLight.layers.enable(scafLayer);
		ambiantLight.layers.enable(rawLayer);
		pointLight.layers.enable(rawLayer);
		ambiantLight.layers.enable(meshLayer);
		pointLight.layers.enable(meshLayer);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		this.handSurface = Display.loadSurfaceView("off", Hand.hand_off, {transparent: true, opacity: 0.3});
		this.handSurface.layers.set(surfaceLayer);
		this.group.add(this.handSurface);

		const handSkel = loadIncidenceGraph('ig', Hand.hand2D_ig);
		this.handSkel = new Renderer(handSkel);
		this.handSkel.edges.create({layer: skelLayer, material: meshEdgeMaterial, size: 2}).addTo(this.group);
		this.handSkel.faces.create({layer: skelLayer, side: THREE.DoubleSide}).addTo(this.group);

		const handScaf = loadCMap2('off', Hand.handScaffold_off);
		this.handScaf = new Renderer(handScaf);
		this.handScaf.edges.create({layer: scafLayer, material: scafEdgeMaterial, size: 3}).addTo(this.group);


		// this.handVol = Display.load_volumes_view("mesh", holes_mesh);
		this.handRawVol = Display.loadVolumesView("mesh", Hand.handRaw_mesh);
		this.handRawVol.layers.set(rawLayer);
		this.group.add(this.handRawVol);

		this.handRaw2Vol = Display.loadVolumesView("mesh", Hand.handRaw2_mesh);
		this.handRaw2Vol.layers.set(raw2Layer);
		this.group.add(this.handRaw2Vol);


		this.handVol = Display.loadVolumesView("mesh", Hand.hand_mesh);
		this.handVol.layers.set(meshLayer);
		this.group.add(this.handVol);

		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;

		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		};

		const offsetAngle = Math.PI / 3.75;
		this.handSurface.setRotationFromAxisAngle(new THREE.Vector3(-1,0,0), offsetAngle);
		this.handSkel.edges.mesh.setRotationFromAxisAngle(new THREE.Vector3(-1,0,0), offsetAngle);
		this.handSkel.faces.mesh.setRotationFromAxisAngle(new THREE.Vector3(-1,0,0), offsetAngle);
		this.handScaf.edges.mesh.setRotationFromAxisAngle(new THREE.Vector3(-1,0,0), offsetAngle);
		this.handRawVol.setRotationFromAxisAngle(new THREE.Vector3(-1,0,0), offsetAngle);
		this.handRaw2Vol.setRotationFromAxisAngle(new THREE.Vector3(-1,0,0), offsetAngle);
		this.handVol.setRotationFromAxisAngle(new THREE.Vector3(-1,0,0), offsetAngle);
		

		this.loop = function(){
			if(this.running){
				glRenderer.setSize(DOM_Hand0.width, DOM_Hand0.height);
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 90 * this.time);
				this.camera.layers.enable(skelLayer);

				glRenderer.render(this.scene, this.camera);
				contextHand0.clearRect(0, 0, DOM_Hand0.width, DOM_Hand0.height);
				contextHand0.drawImage(glRenderer.domElement, 0, 0);

				this.camera.layers.enable(scafLayer);
				glRenderer.render(this.scene, this.camera);
				contextHand1.clearRect(0, 0, DOM_Hand1.width, DOM_Hand1.height);
				contextHand1.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(scafLayer);

				this.camera.layers.enable(rawLayer);
				glRenderer.render(this.scene, this.camera);
				contextHand2.clearRect(0, 0, DOM_Hand2.width, DOM_Hand2.height);
				contextHand2.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(rawLayer);

				this.camera.layers.enable(raw2Layer);
				glRenderer.render(this.scene, this.camera);
				contextHand3.clearRect(0, 0, DOM_Hand3.width, DOM_Hand3.height);
				contextHand3.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(raw2Layer);

				this.camera.layers.enable(meshLayer);
				glRenderer.render(this.scene, this.camera);
				contextHand4.clearRect(0, 0, DOM_Hand4.width, DOM_Hand4.height);
				contextHand4.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(meshLayer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});