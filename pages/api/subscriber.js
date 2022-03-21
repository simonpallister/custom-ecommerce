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
    if (scope[1] !== "subscriber" ){
      res.status(400).json({error: "Wrong entity"})
      return
    }
    const subscriber_id = body.data.id

    const { data : { data : subscriber }} = await axios.get(`https://api.bigcommerce.com/stores/${process.env.NEXT_PUBLIC_BC_STORE_ID}/v3/customers/subscribers/${subscriber_id}`, {
        headers: {
            "Accept": "application/json",
            "X-Auth-Token": process.env.NEXT_PUBLIC_BC_AUTH_TOKEN
        }
    })

    const events = [
      {
        resource: "customer",
        event: `${scope[2]}`,
        data_source_id: process.env.NEXT_PUBLIC_AP_DATA_SOURCE,
        data: {
            id: subscriber.id.toString(),
            email: subscriber.email,
            email_marketing: true,
            billing: {},
            created_at: subscriber.date_created,
            updated_at: subscriber.date_modified
    }
      }
    ]

    const result = await execute(events)
    console.log(`Subscriber ${subscriber.id} ${scope[2]}`)
    res.status(200).json({ message: `Subscriber ${subscriber.id} ${scope[2]}` })


  } catch (e)
  {
    res.status(400).json({error: e.toString()})
    return
  }

}
