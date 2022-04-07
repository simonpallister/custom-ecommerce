import axios from 'axios'
import execute from '../../lib/ortto'

const get_categories = async (page) => {

  const response = await axios.get(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/catalog/categories/?limit=20&page=${page}`, {
      headers: {
          "Accept": "application/json",
          "X-Auth-Token": process.env.BC_AUTH_TOKEN
      }
  })

  return response.data
}

const get_product_count = async (category_id) => {

  const response = await axios.get(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/catalog/products?categories:in=${category_id}&limit=1`, {
      headers: {
          "Accept": "application/json",
          "X-Auth-Token": process.env.BC_AUTH_TOKEN
      }
  })

  return response.data.meta.pagination.total
}

export default async function handler(req, res) {
  const { body } = req

  console.log(body)

  if (req.method === "GET"){
    const response = await axios.post('https://api.ap3api.com/v1/ecommerce/categories', 
      "{}",
      {
        headers: {
          "X-Api-Key": process.env.AP_API_KEY,
          "Content-Type": "application/json"
        }
      }
    )
    res.status(200).json(response.data)
    return
  }


  if (req.method != "POST"){
    res.status(400).json({error: {code: 400, message: "Method Not Allowed"}})
    return
  }

  console.log()

  try {
    const scope = body.scope.split("/")
    if (scope[1] !== "category" ){
      res.status(400).json({error: "Wrong entity"})
      return
    }

    const { data : category } = await axios.get(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v2/catalog/categories/${categoryId_id}`, {
        headers: {
            "Accept": "application/json",
            "X-Auth-Token": process.env.BC_AUTH_TOKEN
        }
    })

    const events = [
      {
        resource: "category",
        event: "created", // "`${scope[2]}`",
        data_source_id: process.env.AP_DATA_SOURCE_ID,
        data: {
          id: category.id.toString(),
          name: category.name,
          slug: category.custom_url.url,
          url: `${process.env.BC_STORE_DOMAIN}`+category.custom_url.url,
          description: category.description,
          total_products: product_count,
          image_url: category.image_url
        }
      }
    ]

    const result = await execute(events)
    console.log(`Category ${category_id} ${scope[2]}`)
    res.status(200).json({ message: `Category ${category_id} ${scope[2]}` })

  } catch (e)
  {
    res.status(400).json({error: e.toString()})
    return
  }}
