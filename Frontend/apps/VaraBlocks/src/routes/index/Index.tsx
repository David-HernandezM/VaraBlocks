import { Link } from 'react-router-dom';
import IndexImage from '@/assets/images/image_index.png';
import { DndContext, DragOverlay, useDroppable, useDraggable, DraggableAttributes } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { createPortal } from 'react-dom';
import { SortableTree } from '@/components/DndLibrary';

import './Index.scss';
import { useState, forwardRef, useEffect } from 'react';
import { TreeItems } from '@/components/DndLibrary/Tree/types';
import { generateRandomString } from '@/app/utils';
import { VirtualContractType2 } from '@/app/types';



export default function Index() {

    const [contractEnums, setContractEnums] = useState([]);
    const [contractStructs, setContractStructs] = useState([]);
    const [codeBlockItems, setcodeBlockItems] = useState<TreeItems>(
      [
        {
          id: 'Home',
          children: [],
        },
        {
            id: 'Nav',
            children: [],
        },
        {
          id: 'Collections',
          children: [
            {id: 'Spring', children: []},
            {id: 'Summer', children: []},
            {id: 'Fall', children: []},
            {id: 'Winter', children: []},
          ],
        },
        {
          id: 'About Us',
          children: [],
        },
        {
          id: 'My Account',
          children: [
            {id: 'Addresses', children: []},
            {id: 'Order History', children: []},
          ],
        },
    ]
    );

    const x: VirtualContractType2 = { UNumVal: 4 };
    

    return (
        <>
        <div className='index-container'>
            <SortableTree items={codeBlockItems} setItems={setcodeBlockItems} />
        </div>
        <button onClick={() => {
          setcodeBlockItems([{ id: generateRandomString(15), children: []}, ...codeBlockItems]) 
          console.log("ya se guardo segun!");
          console.log(codeBlockItems);
          
          
        }}>
          Add Item
        </button>
        {/* <div className='index-container'>
            <SortableTree />
        </div> */}
        </>
    );


    // const containers = ['A', 'B', 'C'];
    // const [parent, setParent] = useState(null);
    // const [avr, setAvr] = useState([]);
    // const [isDragging, setIsDragging] = useState(false);
    // const draggableMarkup = (
    //     <Draggable id="draggable">Drag me</Draggable>
    // );

    // // const draggableMarkup = (
    // //     <DraggableItem id="draggable">Drag me</DraggableItem>
    // // );

    // return (
    //     <div className='index-container'>
    //         <DndContext 
    //             onDragStart={handleDragStart} 
    //             onDragEnd={({delta}) => {
    //                 setCoordinates(({x, y}) => {
    //                   return {
    //                     x: x + delta.x,
    //                     y: y + delta.y,
    //                   };
    //                 });
    //               }}
    //             onDragOver={handleDragOver}
    //         >
    //             {parent === null ? draggableMarkup : null}

    //             {containers.map((id) => (
    //                 // We updated the Droppable component so it would accept an `id`
    //                 // prop and pass it to `useDroppable`
    //                 <Droppable key={id} id={id}>
    //                     {parent === id ? draggableMarkup : 'Drop here'}
    //                 </Droppable>
    //             ))}

    //             {/* {
    //                 createPortal(<
    //                     DragOverlay modifiers={[restrictToParentElement]}>
    //                         {isDragging ? (
    //                             // <Item value={`Item ${activeId}`} /> 
    //                             <button>Drag me</button>
    //                         ): null}
    //                     </DragOverlay>, 
    //                     document.body
    //                 )
    //             } */}

    //                 <DragOverlay modifiers={[restrictToParentElement]}>
    //                     {isDragging ? (
    //                         // <Item value={`Item ${activeId}`} /> 
    //                         <button>Drag me</button>
    //                     ): null}
    //                 </DragOverlay>
    //         </DndContext>
    //     </div>
    // );


    // function handleDragStart(event: any) {
    //     // setActiveId(event.active.id);
    //     setIsDragging(true);
    // }

    // function handleDragOver(event: any) {
    //     // if (event.over) {
    //     //     console.log("parado sobre: ", event.over.id);
    //     //     setParent(event.over.id);
    //     // }
    // }

    // function handleDragEnd(event: any) {
        

    //     const {over} = event;


    //     // If the item is dropped over a container, set it as the parent
    //     // otherwise reset the parent to `null`
    //     setParent(over ? over.id : null);
    //     setIsDragging(false);
    // }
}

// interface ItemProps {
//     ref: any,
//     itemProps: any,
//     children: any,
// }

// const Item = forwardRef(({ref, children, itemProps}: ItemProps) => {
//     return (
//       <li {...itemProps} ref={ref}>{children}</li>
//     )
//   });

// function Droppable(props: any) {
//     const {isOver, setNodeRef} = useDroppable({
//       id: props.id,
//     });
//     const style = {
//       color: isOver ? 'green' : undefined,
//     };
    
    
//     return (
//       <div ref={setNodeRef} style={style}>
//         {props.children}
//       </div>
//     );
// }

// function DraggableItem(props: any) {
//     const {attributes, listeners, setNodeRef} = useDraggable({
//       id: props.id,
//     });
    
//     return (
//       <Item ref={setNodeRef} itemProps={{...attributes, ...listeners}}>
//         {props.children}
//       </Item>
//     )
// };

// function Draggable(props: any) {
//     const {attributes, listeners, setNodeRef, transform} = useDraggable({
//       id: props.id,
//     });

//     const style = transform ? {
//       transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
//       opacity: "0.4"
//     } : undefined;
  
    
//     return (
//       <button ref={setNodeRef} style={style} {...listeners} {...attributes} >
//         {props.children}
//       </button>
//     );
  
// }




// <h2 className='index-container__title'>What is NeuroShark?</h2>
//             <p className='index-container__description'>NeuroShark is a web3 service whose purpose is to allow users to address less frequent problems by using neural networks on the blockchain.</p>
//             <Link to='account' className='index-container__button-account'>Build!</Link>