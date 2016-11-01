<h1>Drag and drop for Angular 2</h1>
<p>
Import DragDropModule module, which define 3 directives :
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
	</li>
	<li><h3>alx-dropzone</h3>
		<p>Indicate that the tag in which it is contained is a drop zone. At least, you also have to add a alx-ondrop attribute to specify what to do in case of actual drop, exemple:</p>
		<code>(alx-ondrop)="append($event)"</code>
		<p>where $event will contains a reference to the value associated with the actual drag.
		<p>Optionnally, you can also add following attributes:</p>
		<ul>
			<li><h4>alx-accept-fct</h4>
				<p>It has to be associated to a function typed (obj: any) => boolean. This function will return true if obj can be dropped on the drop-zone. The default fucntion always return true.
				</p>
				<p>Exemple: 
					<code>[alx-accept-fct]="isAcceptable"</code>
				</p>
			</li>
			<li><h4>alx-dragstart-css</h4>
				<p>A CSS class to be added the the tag containing the alx-dropzone attribut when the drag start and if the drop zone accept the value associated to the drag</p>
			</li>
			<li><h4>alx-draghover-css</h4>
				<p>A CSS class to be added the the tag containing the alx-dropzone attribut when the pointer is over the drop zone and if the drop zone accept the value associated to the drag</p>
			</li>
		</ul>
	</li>
</ol>
</p>