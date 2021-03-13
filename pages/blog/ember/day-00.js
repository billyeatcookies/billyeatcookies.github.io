import { Component } from "react"
import Prism from "prismjs"

import "prismjs/components/prism-csharp.js"
import "prismjs/plugins/line-numbers/prism-line-numbers.js"
import "prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.js"

import Header from "../../../components/header.js"
import Footer from "../../../components/footer.js"
import HeadMetadata from "../../../components/headMetadata.js"

export default class extends Component {
	componentDidMount() {
		Prism.highlightAll()
	}

	render() {
		return (
			<div className="layout-wrapper">
				<HeadMetadata
					title="Building a 3D Engine, Ember: Day 00 | Billy's Blog"
					metaDescription="Ember is my 3D engine project, this is the dev-blog of day 0."
				/>
				<Header />
				<div className="blog-post-container">
					<div className="blog-post-top-section">
						<h1>Building a 3D Engine, Ember: Day 00</h1>
						<div className="blog-post-top-meta">
							<span>5/1/2020</span>
							<a className="blog-post-top-tag-btn" href="/blog/tags/ember">
								<span>Ember</span>
							</a>
						</div>
					</div>
					<div className="blog-post-body-content">
						<h2>The first day</h2>
						<p>I had an idea about building my own 3D engine, so decided to give it a go this time.</p>
						<p><b>Universal Windows Platform</b> seemed a better choice for this project. Also I will be using some libraries that will do the job for me, <b>SharpDX</b>, a managed wrapper on top of DirectX. And For the time being, I named the project <i>SoftEngine</i>. Added the required nuget packges. And kicked off the project!</p>
						<h4>The Engine's process in a Nutshell</h4>
						<p>In the engine, we're rendering the complete scene during each frame with the hope of keeping an optimal 60 FPS to keep fluid animations. To do the rendering job, we need a back buffer. This could be seen as 2 dimensional array mapping the window size. Every cell of the array is mapped to a pixel on the screen.
In XAML UWP apps, we will use a byte[] array that will act as our dynamic <b>back buffer</b>. For every frame being rendered in the animation loop (tick),this buffer will be affected to a WritableBitmap acting as the source of a XAML image control that will be called <b>front buffer</b>. For the rendering loop, we're going to ask to the XAML rendering engine to call us every time it will generate. The registration is done like this</p>
						<p>In XAML UWP apps, we will use a byte[] array that will act as our dynamic <b>back buffer</b>. For every frame being rendered in the animation loop (tick),this buffer will be affected to a WritableBitmap acting as the source of a XAML image control that will be called <b>front buffer</b>. For the rendering loop, we're going to ask to the XAML rendering engine to call us every time it will generate. The registration is done like this</p>
						
						<div className="blog-post-body-code-snippet">
							<pre className="line-numbers language-csharp">
								<code className="csharp language-csharp">
									{
										`
											CompositTarget.Rendering += CompositionTarget_Rendering;
										`
									}
								</code>
							</pre>
						</div>

						<h4>Camera and Mesh Objects</h4>
						<p>First of all, there should be two objects defined that will embed the details needed for a camera and for a mesh. A mesh, well is a cool name to describe a 3D object ;)</p>
						<p>The Camera will have two properties: It's position in the 3D world and where it's looking at, the target. Both are Vector3's. I used SharpDX.Vector3 for that; it works the same way as UnityEngine.Vector3 works. </p>

						<div className="blog-post-body-code-snippet">
							<pre className="line-numbers language-csharp">
								<code className="csharp language-csharp">
									{
										`
											public class Camera
											{
												public Vector3 Position { get; set; }
												public Vector3 Target { get; set; }
											}
										`
									}
								</code>
							</pre>
						</div>

						<p>The Mesh will have a collection of vertices that will be used to build our 3D object, it's position in the 3D world and it's rotation state. To identify it, it will also have a name.</p>

						<div className="blog-post-body-code-snippet">
							<pre className="line-numbers language-csharp">
								<code className="csharp language-csharp">
									{
										`
											public class Mesh
											{
												public string Name { get; set; }
												public Vector3[] Vertices { get; private set; }
												public Vector3 Position { get; set; }
												public Vector3 Rotation { get; set; }
											
												public Mesh(string name, int verticesCount)
												{
													Vertices = new Vector3[verticesCount];
													Name = name;
												}
											}
										`
									}
								</code>
							</pre>
						</div>

						<p>So, now if i want to make a cube object, I can simply pass the 8 vertices to the mesh object. X=0, Y=0, Z=0 will be the center of the cube.</p>

						<div className="blog-post-body-code-snippet">
							<pre className="line-numbers language-csharp">
								<code className="csharp language-csharp">
									{
										`
											var mesh = new Mesh("Cube", 8);
											mesh.Vertices[0] = new Vector3(-1, 1, 1);
											mesh.Vertices[1] = new Vector3(1, 1, 1);
											mesh.Vertices[2] = new Vector3(-1, -1, 1);
											mesh.Vertices[3] = new Vector3(-1, -1, -1);
											mesh.Vertices[4] = new Vector3(-1, 1, -1);
											mesh.Vertices[5] = new Vector3(1, 1, -1);
											mesh.Vertices[6] = new Vector3(1, -1, 1);
											mesh.Vertices[7] = new Vector3(1, -1, -1);
										`
									}
								</code>
							</pre>
						</div>

						<h4>The Device Object</h4>

						<p>This is the most important part, the core of our engine. In it’s rendering function, we will build the view matrix and the projection matrix based on the camera we will have defined before.</p>
						<p>Then we will iterate through each available mesh to build their associated world matrix based on their current rotation and translation values. The final transformation matrix will look like this:</p>

						<div className="blog-post-body-code-snippet">
							<pre className="line-numbers language-csharp">
								<code className="csharp language-csharp">
									{
										`
											var transformMatrix = worldMatrix * viewMatrix * projectionMatrix;
										`
									}
								</code>
							</pre>
						</div>

						<p>Using this transformation matrix, we're going to project each vertex of each mesh in the 2D world to obtain X,Y coordinates from their X,Y,Z coordinates. To finally draw on screen, we're adding a small clip logic to only display visible pixels via a PutPixel funtion.</p>
						
						<div className="blog-post-body-code-snippet">
							<pre className="line-numbers language-csharp">
								<code className="csharp language-csharp">
									{
										`
											public void PutPixel(int x, int y, Color4 color)
											{
												// As we have a 1-D Array for our back buffer
												// we need to know the equivalent cell in 1-D based
												// on the 2D coordinates on screen
												var index = (x + y * bmp.PixelWidth) * 4;
											
												backBuffer[index] = (byte)(color.Blue * 255);
												backBuffer[index + 1] = (byte)(color.Green * 255);
												backBuffer[index + 2] = (byte)(color.Red * 255);
												backBuffer[index + 3] = (byte)(color.Alpha * 255);
											}
										`
									}
								</code>
							</pre>
						</div>

						<h4>Combining all the mechanics</h4>

						<p>Finally we need to:</p>
						<ul>
							<li>create a mesh, we will go for a cube.</li>
							<li>create a camera and target it to our mesh.</li>
							<li>Instantiate Device object.</li>
						</ul>

						<p>Once, done we will launch the rendering loop. In optimal cases this loop will be called every 16ms (60 FPS). During each tick, we will launch the following logic every time:</p>
						<ol>
							<li>clear the screen and all associated pixels with black ones.</li>
							<li>Update various position & rotation values of our meshes.</li>
							<li>Render them into the back buffer by doing the required matrix operations.</li>
							<li>Display them on screen by flushing the back buffer data into the front buffer.</li>
						</ol>

						<div className="blog-post-body-code-snippet">
							<pre className="line-numbers language-csharp">
								<code className="csharp language-csharp">
									{
										`
											private Device device;
											Mesh mesh = new Mesh("Cube", 8);
											Camera mera = new Camera();
											
											private void Page_Loaded(object sender, RoutedEventArgs e)
											{
												// Choose the back buffer resolution here
												WriteableBitmap bmp = new WriteableBitmap(640, 480);
											
												device = new Device(bmp);
											
												// Our XAML Image control
												frontBuffer.Source = bmp;
											
												mesh.Vertices[0] = new Vector3(-1, 1, 1);
												mesh.Vertices[1] = new Vector3(1, 1, 1);
												mesh.Vertices[2] = new Vector3(-1, -1, 1);
												mesh.Vertices[3] = new Vector3(-1, -1, -1);
												mesh.Vertices[4] = new Vector3(-1, 1, -1);
												mesh.Vertices[5] = new Vector3(1, 1, -1);
												mesh.Vertices[6] = new Vector3(1, -1, 1);
												mesh.Vertices[7] = new Vector3(1, -1, -1);
											
												mera.Position = new Vector3(0, 0, 10.0f);
												mera.Target = Vector3.Zero;
											
												// Registering to the XAML rendering loop
												CompositionTarget.Rendering += CompositionTarget_Rendering;
											}
											
											// Rendering loop handler
											void CompositionTarget_Rendering(object sender, object e)
											{
												device.Clear(0, 0, 0, 255);
											
												// rotating slightly the cube during each frame rendered
												mesh.Rotation = new Vector3(mesh.Rotation.X + 0.01f, mesh.Rotation.Y + 0.01f, mesh.Rotation.Z);
											
												// Doing the various matrix operations
												device.Render(mera, mesh);
												// Flushing the back buffer into the front buffer
												device.Present();
											}
										`
									}
								</code>
							</pre>
						</div>

						<p>And as a final result I got this,</p>
						<img src="https://i.ibb.co/0GchHZy/dots.png" />
						<p>Next I will look into drawing lines between each vertex and the concept of faces or triangles.</p>
						<p>That's it for day 0, it was a lot of fun, cya!</p>
						
					</div>
				</div>
				<script src="https://utteranc.es/client.js"
					repo="billyeatcookies/Ember"
					issue-term="pathname"
					label="Discussions"
					theme="github-light"
					crossorigin="anonymous"
					async>
				</script>
				<Footer />
			</div>
		)
	}
}
