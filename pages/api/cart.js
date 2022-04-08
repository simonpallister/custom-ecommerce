import axios from "axios"
import execute from "../../lib/ortto"

export default async function handler(req, res) {
  const { body } = req

  console.log(body)

  if (req.method != "POST") {
    res
      .status(400)
      .json({ error: { code: 400, message: "Method Not Allowed" } })
    return
  }

  try {
    const scope = body.scope.split("/")

    if (scope[1] !== "cart") {
      res.status(400).json({ error: "Wrong entity" })
      return
    }

    if (
      scope[2] === "lineItem" ||
      (scope[2] !== "created" && scope[2] !== "updated")
    ) {
      res.status(200).json({ message: "OK" })
      return
    }

    const cart_id = body.data.id

    const { data: { data: { cart }}} = await axios.get(
      `https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/checkouts/${cart_id}?include=cart.line_items.physical_items.options`,
      {
        headers: {
          Accept: "application/json",
          "X-Auth-Token": process.env.BC_AUTH_TOKEN,
        },
      }
    )

    console.log(cart)

    const line_items = cart.line_items.physical_items.map((line_item) => {
      const item = {
        product_id: line_item.product_id,
        quantity: line_item.quantity,
        total_price: line_item.list_price,
        subtotal_price: line_item.sale_price,
        discount_price: line_item.discount_amount,
        name: line_item.name
      }

      if(line_item.options.length>0){
        item.variant_id = line_item.variant_id,
        item.name = line_item.name + " " + line_item.options.map((option) => {
          return `${option.name} : ${option.value}`
        }).join(", ")
      }
  
      return item

    })

    const events = [
      {
        resource: "cart",
        event: scope[2],
        data_source_id: process.env.AP_DATA_SOURCE_ID,
        customer: {
          id: cart.customer_id.toString(),
          email: cart.email,
        },
        data: {
          id: cart.id,
          currency: cart.currency.code,
          total_price: cart.cart_amount_inc_tax,
          total_tax: cart.cart_amount_inc_tax - cart.cart_amount_ex_tax,
          subtotal_price: cart.cart_amount_inc_tax,
          shipping_total: cart.shipping_cost_inc_tax,
          shipping_tax: cart.shipping_cost_inc_tax - cart.shipping_cost_inc_tax,
          discounts_total_price: cart.discount_amount,
          line_items: line_items,
          coupon_codes: cart.coupons,
          created_at: cart.created_time,
          updated_at: cart.updated_time
        },
      },
    ]

    const result = await execute(events)
    console.log(`Cart ${cart_id} ${scope[2]}`)
    res.status(200).json({ message: `Cart ${cart_id} ${scope[2]}` })

  } catch (e) {
    console.log(e)
    res.status(200).json({ error: e.toString() })
    return
  }
}
