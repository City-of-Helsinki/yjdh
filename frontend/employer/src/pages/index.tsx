import { NextPage } from 'next';
import Link from 'next/link';
import * as React from 'react';
import Layout from 'shared/components/Layout';

type Application = {
  id: number;
  title: string;
};

type Props = {
  posts: Application[];
};

const EmployerIndex: NextPage<Props> = ({ posts }) => (
  <Layout>
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link passHref href={`/${post.id}`}>
            <a>{post.title}</a>
          </Link>
        </li>
      ))}
    </ul>
  </Layout>
);

EmployerIndex.getInitialProps = async () => {
  const posts = [
    { id: 1, title: 'hakemus 1' },
    { id: 2, title: 'hakemus 2' },
  ];
  return { posts };
};

export default EmployerIndex;
