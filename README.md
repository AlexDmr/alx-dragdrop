<h1>Drag and drop for Angular 2: works with mouse and touches</h1>
<p>
    Support for Angular 5.
    <br/>
    <code>import {DragDropModule} from "alx-dragdrop";</code>
</p>

<h2>Usage</h2>
<p>
	A clone of the dragged element will be inserted in the DOM, as a direct child of body. It will contains tha CSS class "alx-cloneNode".
	You can use that information to specify CSS rule in order, for instance, to apply opacity to the clone.
</p>
<pre>
	body > .alx-cloneNode {
		opacity: 0.7;
	}
</pre>
<p>
	Don't forget to use ONCE, at the beginning, the alx-dragdrop directive.
	Then, to make a component (or any HTML tag) draggable, use alx-draggable directive. Its value is what will be transmitted by the drag.
</p>
<pre>
	&lt;section [alx-draggable]=&quot;{someAttribute: 'hello', someOther: 34}&quot;&gt; ... &lt;/section&gt;
</pre>
<p>
	In order to define a drop zone, one could do:
</p>
<pre>
	&lt;section alx-dropzone (alx-ondrop)=&quot;DoSomethingWhenDrop($event)&quot;&gt; ... &lt;/section&gt;
</pre>
<p>
	You can refine the dropzone to precise what kind of drag you want to accept.
	It is also possible to define some CSS classes to provide some feedback during the interaction.
</p>
<pre>
	&lt;section alx-dropzone 
		[alx-accept-function]=&quot;hasAttributeSome&quot; 
		alx-drag-css = &quot;dropCandidate&quot; 
		alx-drag-over-css = &quot;canDrop&quot; 
		(alx-ondrop)=&quot;DoSomethingWhenDrop($event)&quot; &gt; 
		... 
	&lt;/section&gt; 
	_________________________________________________________________ 
	class MyComponent { 
		hasAttributeSome( draggedData: any ) : boolean { 
			return typeof draggedData.someAttribute !== &quot;undefined&quot; 
		}
	}
</pre>

<h2>API</h2>
<p>
	Start by importing DragDropModule module, which defines 3 directives :
</p>
<ol>
	<li><h3>alx-dragdrop</h3>
		<p>Attribute directive that has to be present once at the beggining, before any use of the other drag and drop directives.</p>
	</li>
	<li><h3>alx-draggable</h3>
		<p>Attribute directive that indicate that the tag in wich it is contained is draggable. The value associated with alx-draggable is the information that will be be transmited by the drag.</p>
		<section>Exemple :
			<code>alx-draggable="hello"</code>
			will transmit the string hello.
		</section>
		<section>Exemple :
			<code>[alx-draggable]="exp"</code>
			will transmit the value of the expression exp evaluated in the context.
		</section>
		<section>
			In addition, you can optionnally specify the following attribute related to the drag :
			<ul>
				<li><h4>alx-start-delay</h4>
					<p>	This attribute indicates, in milliseconds, the delay during which the pointer has to remain fixed before the drag can be started.
						This delay is intended to enable scrolling with touch or interacting with bouton (click), etc.
						By default, this delay is set to 100ms.
					</p>
					<code>alx-start-delay = "100"</code>
				</li>
				<li><h4>alx-start-distance</h4>
					<p>	This attribute indicates, in pixels, the distance that the pointer should not reach during start-delay.
						This distance is especially intended to enable scrolling with touch. 
						By default, this distance is set to 20 pixels.
					</p>
					<code>alx-start-distance = "20"</code>
				</li>
				<li><h4>alx-drag-start</h4>
					<p>	This attribute represent an event emitter.
					 	The event will be triggered every time the element start to be dragged.
					 	The value transmitted in $event is the dragged data.
					</p>
					<code>(alx-drag-start) = "DoSomethingWhenDragStartWith($event)"</code>
				</li>
				<li><h4>alx-drag-end</h4>
					<p>	This attribute represent an event emitter.
					 	The event will be triggered every time the element stop being dragged.
					 	The value transmitted in $event is the dragged data.
					</p>
					<code>(alx-drag-end) = "DoSomethingWhenDragEndWith($event)"</code>
				</li>
			</ul>
		</section>
	</li>
	<li><h3>alx-dropzone</h3>
		<p>Indicate that the tag in which it is contained is a drop zone. At least, you also have to add a alx-ondrop attribute to specify what to do in case of actual drop, exemple:</p>
		<code>(alx-ondrop)="append($event)"</code>
		where $event will contains a reference to the value associated with the actual drag.
		<p>Possible attributes are listed below:</p>
		<ul>
			<li><h4>alx-ondrop (mandatory)</h4>
				<p>	An event emitter that will be triggered when the drop occur.
					$event references the dragged data.
				</p>
				<code>(alx-ondrop) = "DoSomethingWithDraggedData($event)"</code>
			</li>
			<li><h4>alx-accept-function (optionnal)</h4>
				<p>	It has to be associated to a function typed (data: any) => boolean. 
					The function will be called with the parameter data referencing the dragged data.
					This function will return true if obj can be dropped on the drop-zone. 
					The default fucntion always return true.
				</p>
				<code>[alx-accept-function]="isAcceptable"</code>
			</li>
			<li><h4>alx-drag-css (optionnal)</h4>
				<p>A CSS class to be added the the tag containing the alx-dropzone attribut when the drag start and if the drop zone accept the value associated to the drag
				</p>
				<code>alx-drag-css = "dropCandidate"</code>
			</li>
			<li><h4>alx-drag-over-css (optionnal)</h4>
				<p>A CSS class to be added the the tag containing the alx-dropzone attribut when the dragging pointer is over the dropzone and the dropzone accept the drop.
				</p>
				<code>alx-drag-over-css = "canDrop"</code>
			</li>
			<li><h4>alx-drag-over-css-for-draggable (optionnal)</h4>
				<p>A CSS class to be added the the drag clone (selectable via "body > .alx-cloneNode")
				</p>
				<pre>alx-drag-over-css-for-draggable = "canBeDropDropped"</pre>
				<pre>
body > .alx-cloneNode.canBeDropDropped {
	transform: scale(0.9, 0.9);
}
				</pre>
			</li>


</ol>
</p>
