import Layout from "shared/components/Layout";
import { NextPage } from "next";
import Link from "next/link";
import * as React from "react";

type Application = {
  id: number,
  title: string,
}

type Props = {
  posts: Application[];
}

const KesaseteliIndex: NextPage<Props> = ({ posts }) => (
    <Layout>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link passHref href={`/${post.id}`}>
              <a>{post.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );

KesaseteliIndex.getInitialProps = async () => {
  const posts = [
    { id: 1, title: "hakemus 1" },
    { id: 2, title: "hakemus 2" }
  ];
  return { posts };
};

export default KesaseteliIndex;
