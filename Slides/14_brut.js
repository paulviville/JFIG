import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import * as Display from '../CMapJS/Utils/Display.js';
import * as Metatron from '../Files/metatron_files.js';
import * as Holes from '../Files/holes_files.js';
import {loadGraph} from '../CMapJS/IO/GraphFormats/GraphIO.js';
import {loadIncidenceGraph} from '../CMapJS/IO/IncidenceGraphFormats/IncidenceGraphIO.js';
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer, meshEdgeColor, meshEdgeMaterial, ambiantLightInt, pointLightInt} from './parameters.js';

export const html14 = `<div id="Squelettes">
	Maillage Brut
	<hr style="width: 70%; display:flex; justify-content:space-evenly;">
	<div class="r-hstack"> 
		<div class="r-frame">
			<canvas id="brut_input" width="400" height="400"></canvas>
			<p style="font-size:25px; margin-top: 0px;">Surface et squelette</p>
		</div>
		<img src="Images/Utils/arrow.png" height="80px" style="padding-right: 1%; padding-left: 1%;">
		<div class="r-frame">
			<canvas id="brut_output" width="400" height="400"></canvas>
			<p style="font-size:25px; margin-top: 0px;">Maillage brut</p>
		</div>
	</div>

	<aside class="notes">
	</aside>
</div>`

export const slide_brut = new Slide(
	function(section)
	{
		document.getElementById(section).innerHTML = html14;
		const DOM_Input = document.getElementById("brut_input");
		const DOM_Output = document.getElementById("brut_output");

		this.camera = new THREE.PerspectiveCamera(75, DOM_Input.width / DOM_Input.height, 0.1, 1000.0);
		this.camera.position.set(0, 0, 0.7);
		
		const surfaceLayer = 0;
		const meshLayer = 1;
		const skelLayer = 2;

		const context_input = DOM_Input.getContext('2d');
		const context_output = DOM_Output.getContext('2d');

		const orbit_controls_input = new OrbitControls(this.camera, DOM_Input);
		const orbit_controls_output = new OrbitControls(this.camera, DOM_Output);

		this.scene = new THREE.Scene()	
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiantLightInt);
		const pointLight = new THREE.PointLight(0xFFFFFF, pointLightInt);
		pointLight.position.set(10,8,15);

		ambiantLight.layers.enable(meshLayer);
		pointLight.layers.enable(meshLayer);
		ambiantLight.layers.enable(skelLayer);
		pointLight.layers.enable(skelLayer);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		this.metatronSurface = Display.loadSurfaceView("off", Metatron.metatron_off, {transparent: true, opacity: 0.1});
		this.metatronSurface.layers.set(surfaceLayer);
		this.group.add(this.metatronSurface);

		const metatronSkel = loadIncidenceGraph('ig', Metatron.metatron_ig);
		this.metatronSkel = new Renderer(metatronSkel);
		this.metatronSkel.edges.create({layer: surfaceLayer, material: meshEdgeMaterial, size: 80}).addTo(this.group);
		this.metatronSkel.faces.create({layer: surfaceLayer, side: THREE.DoubleSide}).addTo(this.group);


		this.metatronVol = Display.loadVolumesView("mesh", Metatron.metatronRaw_mesh);
		this.metatronVol.layers.set(meshLayer);
		this.group.add(this.metatronVol);

		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;
		
		this.toggle_clipping = function(){
			this.metatronVol.material.uniforms.clipping.value = 1 - this.metatronVol.material.uniforms.clipping.value;
		};

		this.toggle_visible = function(){
			this.metatronVol.visible = !this.metatronVol.visible;
		};


		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		};

		const scale = 0.0075;
		const offset = -0.36;
		this.metatronSurface.scale.set(scale,scale,scale);
		this.metatronSurface.position.set(0,0,offset);
		this.metatronSkel.edges.mesh.scale.set(scale,scale,scale);
		this.metatronSkel.edges.mesh.position.set(0,0,offset);
		this.metatronSkel.faces.mesh.scale.set(scale,scale,scale);
		this.metatronSkel.faces.mesh.position.set(0,0,offset);
		this.metatronVol.scale.set(scale,scale,scale);
		this.metatronVol.position.set(0,0,offset);
		this.metatronVol.geometry.computeBoundingBox()
		this.metatronVol.geometry.computeBoundingSphere()

		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 90 * this.time);

				this.metatronSurface.material.opacity = 0.5;
				this.metatronSurface.material.side = THREE.FrontSide;
				this.camera.layers.enable(skelLayer);
				glRenderer.setSize(DOM_Input.width, DOM_Input.height);
				glRenderer.render(this.scene, this.camera);
				context_input.clearRect(0, 0, DOM_Input.width, DOM_Input.height);
				context_input.drawImage(glRenderer.domElement, 0, 0)
				this.camera.layers.disable(skelLayer);


				this.camera.layers.enable(meshLayer);
				glRenderer.render(this.scene, this.camera);
				context_output.clearRect(0, 0, DOM_Output.width, DOM_Output.height);
				context_output.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(meshLayer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});