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
		<section>
			In addition, you can optionnally specify the following attribute related to the drag :
			<ul>
				<li><h4>alx-touch-delay</h4>
					<p>	This attribute apply to the touch interaction.
						It indicate, in milliseconds, the delay during which the touch has to remain fixed before the drag can be started.
						This delay is intended to enable scrolling with touch. 
						By default, this delay is set to 50ms.
					</p>
					<code>alx-touch-delay = "50"</code>
				</li>
				<li><h4>alx-touch-distance</h4>
					<p>	This attribute apply to the touch interaction.
						It indicate, in pixels, the distance that the touch should not reach during touch-delay.
						This distance is intended to enable scrolling with touch. 
						By default, this delay is set to 20 pixels.
					</p>
					<code>alx-touch-distance = "20"</code>
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
			<li><h4>alx-drag-start (optionnal)</h4>
				<p>	An event emitter that will be triggered when a compatible drag starts.
					$event references the dragged data.
				</p>
				<code>(alx-drag-start) = "DoSomethingWhenDragStartWithData($event)"</code>
			</li>
			<li><h4>alx-drag-end (optionnal)</h4>
				<p>	An event emitter that will be triggered when a compatible drag ends.
					$event references the dragged data.
				</p>
				<code>(alx-drag-end) = "DoSomethingWhenDragEndWithData($event)"</code>
			</li>
			<li><h4>alx-drag-enter (optionnal)</h4>
				<p>	An event emitter that will be triggered when a compatible drag enter the dropzone.
					$event references the dragged data.
				</p>
				<code>(alx-drag-enter) = "DoSomethingWhenDragEnterWithData($event)"</code>
			</li>
			<li><h4>alx-drag-leave (optionnal)</h4>
				<p>	An event emitter that will be triggered when a compatible drag leave the dropzone.
					$event references the dragged data.
				</p>
				<code>(alx-drag-leave) = "DoSomethingWhenDragLeaveWithData($event)"</code>
			</li>
		</ul>
	</li>
</ol>
</p>

    @Output("alx-drag-start") onDragStart   = new EventEmitter<any>();
    @Output("alx-drag-end")   onDragEnd     = new EventEmitter<any>();
    @Output("alx-drag-enter") onDragEnter   = new EventEmitter<any>();
    @Output("alx-drag-leave") onDragLeave   = new EventEmitter<any>();
