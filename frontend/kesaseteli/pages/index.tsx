import * as React from "react";
import Link from "next/link";
import { Layout } from "@frontend/shared/components/Layout";
import { NextPage } from "next";

type Application = {
  id: number,
  title: string,
}

type Props = {
  posts: Application[];
}

const KesaseteliIndex: NextPage<Props> = ({ posts }) => {
  return (
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
};

KesaseteliIndex.getInitialProps = async () => {
  const posts = [
    { id: 1, title: "hakemus 1" },
    { id: 2, title: "hakemus 2" }
  ];
  return { posts };
};

export default KesaseteliIndex;
