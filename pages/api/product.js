import axios from 'axios'
import execute from '../../lib/ortto'

export default async function handler(req, res) {

  const { body } = req

  console.log(body)

  if (req.method != "POST"){
    res.status(400).json({error: {code: 400, message: "Method Not Allowed"}})
    return
  }


  try {
    const scope = body.scope.split("/")
    if (scope[1] !== "product" ){
      res.status(400).json({error: "Wrong entity"})
      return
    }
    const product_id = body.data.id

    if (scope[2]=='inventory'){
      res.status(200).json("")
    }

    const { data : { data : product }} = await axios.get(`https://api.bigcommerce.com/stores/${process.env.NEXT_PUBLIC_BC_STORE_ID}/v3/catalog/products/${product_id}?include=primary_image,variants`, {
        headers: {
            "Accept": "application/json",
            "X-Auth-Token": process.env.NEXT_PUBLIC_BC_AUTH_TOKEN
        }
    })

    const events = [
      {
        resource: "product",
        event: `${scope[2]}`,
        data_source_id: process.env.NEXT_PUBLIC_AP_DATA_SOURCE_ID,
        data: {
            id: product.id.toString(),
            name: product.name,
            url: `${process.env.NEXT_PUBLIC_BC_STORE}${product.custom_url.url}`,
            description: product.description,
            sku: product.sku,
            stock_quantity: product.inventory_level,
            price: product.calculated_price,
            categories: product.categories,
            image_url: product.primary_image?.url_standard,
            created_at: product.date_created,
            updated_at: product.date_modified
        }
      }
    ]

    const result = await execute(events)
    console.log(`Product ${product_id} ${scope[2]}`)
    res.status(200).json({ message: `Product ${product_id} ${scope[2]}` })


  } catch (e)
  {
    res.status(400).json({error: e.toString()})
    return
  }

}
