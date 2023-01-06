import { Inter } from '@next/font/google';
import { Button, Checkbox, Form, Input, message } from "antd";
import clsx from 'clsx';
import Head from 'next/head';
import { Fragment, useEffect, useState } from "react";
import ICredentials from '../interfaces/ICredentials';
import styles from "../styles/Home.module.css";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [credentials, setCredentials] = useState<ICredentials>();
  const [loading, setLoading] = useState<boolean>(false);

  const getCredentials = async () => {
    setLoading(true);
    fetch('/api/credentials', {
      method: 'GET',
    }).then(async (response) => {
      const data = await response.json();
      setCredentials(data);
    }).catch(() => {
      message.error('Failed to load app credentials?.');
    }).finally(() => {
      setLoading(false);
    })
  }

  const saveCredentials = async (values: any) => {
    setLoading(true);
    fetch('/api/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    }).then(async (response) => {
      const data = await response.json();
      setCredentials(data.credentials);

      window.open(data.authorizationUrl, '_blank');
    }).catch(() => {
      message.error('Failed to load app credentials.');
    }).finally(() => {
      setLoading(false);
    })
  }

  useEffect(() => {
    getCredentials();

    return () => {

    }
  }, []);

  return (
    <>
      <Head>
        <title>Shopify oauth bridge</title>
        <meta name="description" content="Generate an authentication URL for the development of Shopify application in a local environment" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={clsx([inter.className, styles.main, "flex flex-col justify-center items-center bg-gray-100 w-screen min-h-screen overflow-hidden"])}>
        <div className='w-full sm:max-w-lg flex flex-col items-center justify-center'>
          <div className='flex flex-col gap-10 p-8 shadow-3xl bg-white rounded-lg w-full'>
            <div className='flex flex-col'>
              <div className='text-2xl font-bold capitalize'>Shopify App's local authentication</div>
              <div className='text-lg'>Generate authenticated URL for Shopify embedded app in local environemnt.</div>
            </div>
            <Form layout='vertical' onFinish={saveCredentials} initialValues={{
              client_id: credentials?.client_id,
              shop: credentials?.config?.shop,
              redirect_uri: credentials?.config?.redirect_uri ?? 'http://locahost:3000',
              scopes: credentials?.config?.scopes ?? 'write_products',
              embedded: credentials?.config?.embedded ?? true,
            }}>
              {credentials?.appSecrets === false ? <Fragment>
                <Form.Item name="client_id" label="Shopify client ID" rules={[{ required: true, message: 'Client ID required' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="client_secret" label="Shopify secret" rules={[{ required: true, message: 'Client secret required' }]}>
                  <Input.Password />
                </Form.Item>
              </Fragment> : <></>}
              <Form.Item name="shop" label="Shop" rules={[{ required: true, message: 'Shop required' }]}>
                <Input addonAfter={<span className='font-bold'>{`.${process.env.NEXT_PUBLIC_SHOPIFY_APP_DOMAIN!}`}</span>} />
              </Form.Item>
              <Form.Item name="scopes" label="Scopes" rules={[{ required: true, message: 'Scope required' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="redirect_uri" label="Local app URL" rules={[{ required: true, message: 'Redirect URI required' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="embedded" label="Embedded" rules={[{ required: true, message: 'Embedded property is required' }]} valuePropName="checked">
                <Checkbox>Embedded application</Checkbox>
              </Form.Item>
              {credentials?.authenticatedUrl ? <div className="bg-blue-50 border-blue-500 p-6 rounded-2xl flex flex-col gap-3">
                <div className="font-bold">Authenticated URL</div>
                <a href={credentials.authenticatedUrl} target="_blank" rel="noreferrer">{credentials.authenticatedUrl}</a>
              </div> : <></>}
              <Button size='large' loading={loading} type="primary" htmlType="submit">
                Login
              </Button>
            </Form>
          </div>
        </div>
      </main>
    </>
  )
}
