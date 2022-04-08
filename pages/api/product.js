import axios from "axios"
import execute from "../../lib/ortto"

const get_products = async () => {
  const { data } = await axios.post(
    "https://api.ap3api.com/v1/ecommerce/products",
    '{"limit":100}',
    {
      headers: {
        "X-Api-Key": process.env.AP_API_KEY,
        "Content-Type": "application/json",
      },
    }
  )
  return data
}

export default async function handler(req, res) {
  const { body } = req

  console.log(body)

  if (req.method === "GET") {
    const products = await get_products()
    res.status(200).json(products)
    return
  }

  if (req.method === "DELETE") {
    const { products } = await get_products()

    const events = products.map(product=> {
      const event = {
        resource: "product",
        event: "deleted",
        data_source_id: process.env.AP_DATA_SOURCE_ID,
        data: {
            id: product.id,
            variant_id: product.variant_id === "" ? null : product.variant_id,
            updated_at: product.updated_at
        }
      }
      return event
    })

    console.log(events)

    const result = await execute(events)
    res.status(200).json({message: "deleted"})
    return
  }

  if (req.method != "POST") {
    res
      .status(400)
      .json({ error: { code: 400, message: "Method Not Allowed" } })
    return
  }

  try {
    const scope = body.scope.split("/")
    if (scope[1] !== "product") {
      res.status(400).json({ error: "Wrong entity" })
      return
    }
    const product_id = body.data.id

    console.log("product_id", product_id)

    if (scope[2] == "inventory") {
      res.status(200).json("")
    }

    let event = []

    if (scope[2] == "deleted") {

      event = {
        resource: "product",
        event: "deleted",
        data_source_id: process.env.AP_DATA_SOURCE_ID,
        data: {
            id: product_id
        }
      }


    } else {

      const {
        data: { data: product },
      } = await axios.get(
        `https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/catalog/products/${product_id}?include=primary_image,variants`,
        {
          headers: {
            Accept: "application/json",
            "X-Auth-Token": process.env.BC_AUTH_TOKEN,
          },
        }
      )
  
      const variants = product.variants.map(variant=>{
  
        const option_names = variant.option_values.map(option=>{
          return `${option.option_display_name}: ${option.label}`
        }) 
  
        if (option_names.length>0){
          const event = {
              resource: "product",
              event: scope[2],
              data_source_id: process.env.AP_DATA_SOURCE_ID,
              data: {
                  id: variant.product_id.toString(),
                  variant_id: variant.id.toString(),
                  name: `${product.name} ${option_names.join(', ')}`,
                  url: process.env.BC_STORE_DOMAIN+product.custom_url.url,
                  description: product.description,
                  sku: variant.sku,
                  stock_quantity: variant.inventory_level,
                  price: variant.calculated_price,
                  categories: product.categories,
                  image_url: product.primary_image?.url_standard,
                  created_at: product.date_created,
                  updated_at: product.date_modified
              }
          }
          if (variant.sale_price > 0 && option_names.length >0 ){
              event.regular_price = variant.price
          }
          return event
        }
  
      })
  
      events = [
        {
          resource: "product",
          event: scope[2],
          data_source_id: process.env.AP_DATA_SOURCE_ID,
          data: {
            id: product.id.toString(),
            name: product.name,
            url: `${process.env.BC_STORE}${product.custom_url.url}`,
            description: product.description,
            sku: product.sku,
            stock_quantity: product.inventory_level,
            price: product.calculated_price,
            categories: product.categories,
            image_url: product.primary_image?.url_standard,
            created_at: product.date_created,
            updated_at: product.date_modified,
          },
        },
      ]
  
      if (variants){
        events = [...events, ...variants]
      }
    }

    const result = await execute(events)
    console.log(`Product ${product_id} ${scope[2]}`)
    res.status(200).json({ message: `Product ${product_id} ${scope[2]}` })

  } catch (e) {

    console.log(e)
    res.status(400).json({ error: e.toString() })
    return

  }
}
