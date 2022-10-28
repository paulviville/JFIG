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

export const html = `<div id="Squelettes">
Résultats
<hr style="width: 70%; display:flex; justify-content:space-evenly;">
<div class="r-hstack"> 
	<div class="r-frame" style="margin-right: 5%">
		<canvas id="result_holes0" width="220" height="400"></canvas>
		<p style="font-size:25px; margin-top: 0px;">SJ: 0.55/0.91 (min/moy)<br>2304 hex</p>
	</div>
	<div class="r-frame">
		<canvas id="result_holes1" width="220" height="400"></canvas>
		<p style="font-size:25px; margin-top: 0px;">SJ: 0.70/0.94 (min/moy)<br>2432 hex</p>
	</div>
</div>
<div class="fragment" id="15_show"></div>
<div class="fragment" id="15_quality"></div>
<div class="fragment" id="15_clipping"></div>

<aside class="notes">
</aside>
</div>`

export const slide_results0 = new Slide(
	function(section)
	{
		document.getElementById(section).innerHTML = html;
		const DOM_Input = document.getElementById("result_holes0");
		const DOM_Output = document.getElementById("result_holes1");

		this.camera = new THREE.PerspectiveCamera(75, DOM_Input.width / DOM_Input.height, 0.1, 1000.0);
		this.camera.position.set(0, 0, 0.8);
		
		const surface_layer = 0;
		const mixte_layer = 1;
		const curve_layer = 2;

		const context_input = DOM_Input.getContext('2d');
		const context_output = DOM_Output.getContext('2d');

		const orbit_controls_input = new OrbitControls(this.camera, DOM_Input);
		const orbit_controls_output = new OrbitControls(this.camera, DOM_Output);

		this.scene = new THREE.Scene()
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiantLightInt);
		const pointLight = new THREE.PointLight(0xFFFFFF, pointLightInt);
		pointLight.position.set(10,8,15);

		ambiantLight.layers.enable(mixte_layer);
		pointLight.layers.enable(mixte_layer);
		ambiantLight.layers.enable(curve_layer);
		pointLight.layers.enable(curve_layer);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		this.holes_surface = Display.loadSurfaceView("off", Holes.holes_off, {transparent: true, opacity: 0.1});
		this.holes_surface.layers.set(surface_layer);
		this.group.add(this.holes_surface);

		const holes_skel = loadIncidenceGraph('ig', Holes.holes_ig);
		this.holes_skel = new Renderer(holes_skel);
		this.holes_skel.edges.create({layer: mixte_layer, material: meshEdgeMaterial}).addTo(this.group);
		this.holes_skel.faces.create({layer: mixte_layer, side: THREE.DoubleSide}).addTo(this.group);

		const holes2_skel = loadIncidenceGraph('ig', Holes.holes2_ig);
		this.holes2_skel = new Renderer(holes2_skel);
		this.holes2_skel.edges.create({layer: curve_layer, material: meshEdgeMaterial}).addTo(this.group);


		// this.holes_vol = Display.load_volumes_view("mesh", holes_mesh);
		this.holes_vol = Display.loadVolumesView("mesh", Holes.holes_mesh);
		this.holes_vol.layers.set(mixte_layer);
		this.group.add(this.holes_vol);

		this.holes2_vol = Display.loadVolumesView("mesh", Holes.holes2_mesh);
		this.holes2_vol.layers.set(curve_layer);
		this.group.add(this.holes2_vol);

		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;
		
		this.toggle_clipping = function(){
			this.holes_vol.material.uniforms.clipping.value = 1 - this.holes_vol.material.uniforms.clipping.value;
			this.holes2_vol.material.uniforms.clipping.value = 1 - this.holes2_vol.material.uniforms.clipping.value;
		};

		this.toggle_visible = function(){
			this.holes_vol.visible = !this.holes_vol.visible;
			this.holes2_vol.visible = !this.holes2_vol.visible;
			this.holes_surface.visible = !this.holes_surface.visible;
			this.holes_skel.edges.mesh.visible = !this.holes_skel.edges.mesh.visible;
			this.holes2_skel.edges.mesh.visible = !this.holes2_skel.edges.mesh.visible;
			this.holes_skel.faces.mesh.visible = !this.holes_skel.faces.mesh.visible;
		};

		this.toggle_material = function(){
			this.holes_vol.material.uniforms.quality.value = 1 - this.holes_vol.material.uniforms.quality.value;
			this.holes2_vol.material.uniforms.quality.value = 1 - this.holes2_vol.material.uniforms.quality.value;
		}


		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		};

		const offsetAngle = Math.PI / 2.4;
		const offsetAxis = new THREE.Vector3(1, 0, 0);
		this.holes_surface.setRotationFromAxisAngle(offsetAxis, offsetAngle);
		this.holes_vol.setRotationFromAxisAngle(offsetAxis, offsetAngle);
		this.holes2_vol.setRotationFromAxisAngle(offsetAxis, offsetAngle);
		this.holes_skel.edges.mesh.setRotationFromAxisAngle(offsetAxis, offsetAngle);
		this.holes2_skel.edges.mesh.setRotationFromAxisAngle(offsetAxis, offsetAngle);
		this.holes_skel.faces.mesh.setRotationFromAxisAngle(offsetAxis, offsetAngle);

		this.holes_vol.visible = false ;
		this.holes2_vol.visible = false;
		this.holes_surface.visible = true;
		this.holes_skel.edges.mesh.visible = true;
		this.holes2_skel.edges.mesh.visible = true;
		this.holes_skel.faces.mesh.visible = true;

		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 90 * this.time);

				this.holes_surface.material.opacity = 0.5;
				this.holes_surface.material.side = THREE.FrontSide;
				this.camera.layers.enable(curve_layer);
				glRenderer.setSize(DOM_Input.width, DOM_Input.height);
				glRenderer.render(this.scene, this.camera);
				context_input.clearRect(0, 0, DOM_Input.width, DOM_Input.height);
				context_input.drawImage(glRenderer.domElement, 0, 0)
				this.camera.layers.disable(curve_layer);

				this.holes_surface.material.opacity = 0.3;
				this.holes_surface.material.side = THREE.BackSide;

				this.camera.layers.enable(mixte_layer);
				glRenderer.render(this.scene, this.camera);
				context_output.clearRect(0, 0, DOM_Output.width, DOM_Output.height);
				context_output.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(mixte_layer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});