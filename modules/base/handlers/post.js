module.exports = ({ context, body }) => {
  if (body.test) {
    return context.ok({ message: "Test post request to base module", ...body })
  }

  context.ok({ message: "Post request to base module" })
}
