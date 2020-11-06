type Props = {
    productState?: any;
    setProductState?: any;
    errorProductState?: any;
  }

  const ProductAttributesForm: FunctionComponent<Props> = ({productState, setProductState}) => {
    const manager = useRef(createDndContext(HTML5Backend));

    const moveCard = useCallback(
      (dragIndex: number, hoverIndex: number) => {
        const dragCard = productState.attributes[dragIndex]

        const reorder = update(productState.attributes,
          { $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ], })
          setProductState({...productState, ['attributes']:  reorder})
      },
      [productState.attributes],
    )

    const rendercard = (item, index, moveCard) => {
          return (

              <DADCard
              key={item.id}
              index={index}
              id={item.id}
              moveCard={moveCard}
              type={<AttributeDragCard  attributes={productState.attributes} item={item} index={index} setProductState={setProductState}></AttributeDragCard>}
              />
          )
      }



      const createEmptyInput = () => {
        let last_item_key = productState.attributes.slice(-1)[0].key + 1
        const input = {"key": last_item_key, "id": last_item_key, "attribute": null, "value": null}
        setProductState(oldstate => ({ ...oldstate, attributes: [...oldstate.attributes, input] }))
      }

      return (
          <>
            {productState.attributes ?
            <div className="product-images">
                <DndProvider manager={manager.current.dragDropManager}>
                    <DragAndDrop renderFunction={rendercard} items={productState.attributes} moveCard={moveCard} />
                </DndProvider>
            </div>
            : null
            }
                    { productState.attributes.length < 3 ?
            <label onClick={createEmptyInput} className="btn btn-primary" id="upload-photo-label" htmlFor="upload-photo"><i className="fas fa-cloud-upload-alt"></i>&nbsp; Add Attribute</label>
          : null
          }
          </>
        )
    }

  export default ProductAttributesForm;
