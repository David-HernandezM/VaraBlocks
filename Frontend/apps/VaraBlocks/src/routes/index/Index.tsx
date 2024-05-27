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

import { useContractUtils } from '@/app/hooks';
import { MAIN_CONTRACT } from '@/app/consts';
import { useAccount } from '@gear-js/react-hooks';
import { ProgramMetadata } from '@gear-js/api';

import { CodeBlock, Variable, ControlFlow, VirtualContractTypes, Match, SendMessage, SendReply, VirtualContractDataToSend, EnumVal } from '@/app/app_types/types';

import { useAppDispatch } from '@/app/hooks';
// import { addBlock } from '@/app/SliceReducers/VaraBlocksTree/varaBlocksTreeSlice';



// import { Virtual }


export default function Index() {
    return (
      <h1>INDEX</h1>
    );
}





























// return (
    //     <>
    //      {/* <button onClick={
    //       async () => {
    //         console.log("Sending message to contract");
    //         if (!account.account) {
    //           console.log("Account isnt initialized");
    //           return;
    //         }

    //         let virtualContractTest: VirtualContractDataToSend = {
    //           metadata: {
    //             init: {
    //               // NoValue: null
    //               In: ['ContractTestInit']
    //             },
    //             handle: {
    //               // InOut: ['ContractActions', 'ContractEvent']
    //               Out: ['ContractTestOut']
    //             }
    //           },
    //           // state: ['ContractState', null],
    //           state: null,
    //           initCode: [
    //             {
    //               Variable: {
    //                 variableName: 'message',
    //                 isMutable: false,
    //                 varType: {
    //                   Enum: null
    //                 },
    //                 varValue: {
    //                   EnumVal: {
    //                     enumFrom: 'ContractEvent',
    //                     val: 'Ping'
    //                   }
    //                 },
    //                 isParameter: false
    //               }
    //             }
    //           ],
    //           handleCode: [
    //             {
    //               LoadMessage: {
    //                 variableName: 'message',
    //                 isMutable: false,
    //                 varType: {
    //                   Enum: null,
    //                 },
    //                 varValue: {
    //                   EnumVal: {
    //                     enumFrom: '',
    //                     val: ''
    //                   }
    //                 },
    //                 isParameter: false
    //               }
    //             },
    //             {
    //               ControlFlow: {
    //                 Match: {
    //                   variableToMatch: 'message',
    //                   enumToMatch: 'ContractActions',
    //                   codeBlock: [
    //                     [
    //                       {
    //                         SendReply: {
    //                           message: {
    //                             enumFrom: 'ContractEvent',
    //                             val: 'Pong'
    //                           }
    //                         }
    //                       }
    //                     ],
    //                     [
    //                       {
    //                         SendMessage: {
    //                           to: account.account.decodedAddress,
    //                           message: {
    //                             enumFrom: 'ContractEvent',
    //                             val: 'Ping'
    //                           }
    //                         }
    //                       },
    //                       {
    //                         SendReply: {
    //                           message: {
    //                             enumFrom: 'ContractEvent',
    //                             val: 'Ping'
    //                           }
    //                         }
    //                       }
    //                     ]
    //                   ]
    //                 }
    //               }
    //             },
    //             {
    //               SendMessage: {
    //                 to: account.account.decodedAddress,
    //                 message: {
    //                   enumFrom: 'ContractEvent',
    //                   val: 'Pong'
    //                 }
    //               }
    //             }
    //           ],
    //           enums: [
    //             [
    //               'ContractActions', 
    //               {
    //                 enumName: 'ContractActions',
    //                 enumType: {
    //                   ContractActions: null
    //                 },
    //                 variants: [
    //                   'Ping',
    //                   'Pong'
    //                 ]
    //               }
    //             ],
    //             [
    //               'ContractEvent',
    //               {
    //                 enumName: 'ContractEvent',
    //                 enumType: {
    //                   ContractEvents: null
    //                 },
    //                 variants: [
    //                   'Ping',
    //                   'Pong'
    //                 ]
    //               }
    //             ]
    //           ],
    //           structs: [
    //             [
    //               'ContractState',
    //               {
    //                 structName: 'ContractState',
    //                 attributes: [
    //                   {
    //                     attributeName: 'last_calls',
    //                     attributeType: {
    //                       Vec: null
    //                     },
    //                     attributeVal: {
    //                       VecVal: {
    //                         VecString: []
    //                       }
    //                     }
    //                   }
    //                 ]
    //               }
    //             ]
    //           ]
    //         }
          
    //         let x = await sendMessage(
    //           account.account.decodedAddress,
    //           account.account.meta.source,
    //           MAIN_CONTRACT.programId,
    //           ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
    //           {
    //             SetVirtualContract: virtualContractTest
    //           },
    //           0,
    //           "Se proceso el mensaje!",
    //           "No se proceso el mensaje",
    //           "Checando si se procesa el mensaje",
    //           "VaraBlocks action:"
    //         );
    //       }
    //     }>
    //       Test Virtual contract
    //     </button> */}
    //     {/* <button onClick={async () => {
    //       console.log("Sending message to contract");
    //       if (!account.account) {
    //         console.log("Account isnt initialized");
    //         return;
    //       }

    //       await sendMessage(
    //         account.account.decodedAddress,
    //         account.account.meta.source,
    //         MAIN_CONTRACT.programId,
    //         ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
    //         // {
    //         //   Test1: virtualContractTest
    //         // },
    //         {
    //           SendMessageToVirtualContract: {
    //             enumFrom: 'ContractActions',
    //             val: 'Ping'
    //           }
    //         },
    //         0,
    //         "Se proceso el mensaje!",
    //         "No se proceso el mensaje",
    //         "Checando si se procesa el mensaje",
    //         "VaraBlocks action:"
    //       );
    //     }}>
    //       Send ping message
    //     </button> */}
    //     {/* <button onClick={ async () => {
    //       console.log("Sending message to contract");
    //       if (!account.account) {
    //         console.log("Account isnt initialized");
    //         return;
    //       }

    //       await sendMessage(
    //         account.account.decodedAddress,
    //         account.account.meta.source,
    //         MAIN_CONTRACT.programId,
    //         ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
    //         // {
    //         //   Test1: virtualContractTest
    //         // },
    //         {
    //           SendMessageToVirtualContract: {
    //             enumFrom: 'ContractActions',
    //             val: 'Pong'
    //           }
    //         },
    //         0,
    //         "Se proceso el mensaje!",
    //         "No se proceso el mensaje",
    //         "Checando si se procesa el mensaje",
    //         "VaraBlocks action:"
    //       );
    //     }}>
    //       Send pong message
    //     </button> */}
    //     {/* <button onClick={ async () => {
    //       console.log("Sending message to contract");
    //       if (!account.account) {
    //         console.log("Account isnt initialized");
    //         return;
    //       }

    //       //3,226.0679
    //       //

    //       await sendMessage(
    //         account.account.decodedAddress,
    //         account.account.meta.source,
    //         MAIN_CONTRACT.programId,
    //         ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
    //         // {
    //         //   Test1: virtualContractTest
    //         // },
    //         {
    //           SendMessageToVirtualContract: {
    //             enumFrom: 'ContractActions',
    //             val: 'Pang'
    //           }
    //         },
    //         0,
    //         "Se proceso el mensaje!",
    //         "No se proceso el mensaje",
    //         "Checando si se procesa el mensaje",
    //         "VaraBlocks action:"
    //       );
    //     }}>
    //       Send pang message
    //     </button> */}
    //     {/* <button onClick={async () => {
    //       console.log("Sending message to contract");
    //       if (!account.account) {
    //         console.log("Account isnt initialized");
    //         return;
    //       }

    //       await sendMessage(
    //         account.account.decodedAddress,
    //         account.account.meta.source,
    //         MAIN_CONTRACT.programId,
    //         ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
    //         {
    //           SetDefaultVirtualContract: null
    //         },
    //         0,
    //         "Se proceso el mensaje!",
    //         "No se proceso el mensaje",
    //         "Checando si se procesa el mensaje",
    //         "VaraBlocks action:"
    //       );
    //     }}>
    //       Set default contract
    //     </button> */}
    //     {/* <button onClick={async () => {
    //       console.log("Sending message to contract");
    //       if (!account.account) {
    //         console.log("Account isnt initialized");
    //         return;
    //       }

    //       await sendMessage(
    //         account.account.decodedAddress,
    //         account.account.meta.source,
    //         MAIN_CONTRACT.programId,
    //         ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
    //         {
    //           AddTestVirtualContract: null
    //         },
    //         0,
    //         "Se proceso el mensaje!",
    //         "No se proceso el mensaje",
    //         "Checando si se procesa el mensaje",
    //         "VaraBlocks action:"
    //       );
    //     }}>
    //       Send tests
    //     </button> */}
    //     {/* <button onClick={async () => {
    //       console.log("Sending message to contract");
    //       if (!account.account) {
    //         console.log("Account isnt initialized");
    //         return;
    //       }

    //       await sendMessage(
    //         account.account.decodedAddress,
    //         account.account.meta.source,
    //         MAIN_CONTRACT.programId,
    //         ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
    //         {
    //           MakeReservation: null
    //         },
    //         0,
    //         "Se proceso el mensaje!",
    //         "No se proceso el mensaje",
    //         "Checando si se procesa el mensaje",
    //         "VaraBlocks action:"
    //       );
    //     }}>
    //       Make Reservation
    //     </button> */}

    //     {/*
    //     <div className='index-container'>
    //         <SortableTree items={codeBlockItems} setItems={setcodeBlockItems} />
    //     </div>
    //     <button onClick={() => {
    //       varaBlocksDispatch(addBlock({ id: generateRandomString(15), blockType: 'variable', children: []}));
    //       setcodeBlockItems([{ id: generateRandomString(15), blockType: 'variable', children: []}, ...codeBlockItems]) 
    //       console.log("ya se guardo segun!");
    //       console.log(codeBlockItems);
          
    //     }}>
    //       Add Variable
    //     </button>
    //      */}
    //     {/* <ul>
    //       <li style={{background: 'red'}}>hola</li>
    //     </ul> */}
      
    //     </>
    // );








    // const [codeBlockItems, setcodeBlockItems] = useState<TreeItems>(
    //   [
    //     {
    //       id: 'Home',
    //       blockType: 'variable',
    //       children: [],
    //     },
    //     {
    //         id: 'Nav',
    //         blockType: 'replymessage',
    //         children: [],
    //     },
    //     {
    //       id: 'Collections',
    //       blockType: 'match',
    //       children: [
    //         {
    //           id: 'Spring', 
    //           blockType: 'sendmessage',
    //           children: []
    //         },
    //         {
    //           id: 'Summer', 
    //           blockType: 'match',
    //           children: [
    //             {
    //               id: 'Test1', 
    //               blockType: 'match',
    //               children: [
    //               {
    //                 id: 'last', 
    //                 blockType: 'variable',
    //                 children: []
    //               }
    //           ]}
    //         ]},
    //         {
    //           id: 'Fall', 
    //           blockType: 'loadmessage',
    //           children: []
    //         },
    //         {
    //           id: 'Winter', 
    //           blockType: 'replymessage',
    //           children: []
    //         },
    //       ],
    //     },
    //     {
    //       id: 'About Us',
    //       blockType: 'sendmessage',
    //       children: [],
    //     },
    //     {
    //       id: 'My Account',
    //       blockType: 'match',
    //       children: [
    //         {
    //           id: 'Addresses', 
    //           blockType: 'replymessage',
    //           children: []
    //         },
    //         {
    //           id: 'Order History', 
    //           blockType: 'sendmessage',
    //           children: []
    //         },
    //       ],
    //     },
    // ]
    // );







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