const { getIndex } = require("./pinecone.service");
const {
  generateEmbedding,
} = require("./embedding.service");

const searchReports = async (
  query,
  topK = 5
) => {
  const queryEmbedding =
    await generateEmbedding(query);

  const index = getIndex();

  const result = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return result.matches || [];
};

module.exports = {
  searchReports,
};